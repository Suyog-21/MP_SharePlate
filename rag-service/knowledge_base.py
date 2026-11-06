"""
SharePlate knowledge base, FAQs, web scraping, and keyword-based retrieval.

This file contains:
  1. KNOWLEDGE_DOCS - Hand-written documents about how SharePlate works
  2. FAQ_DOCS - Comprehensive FAQs answering common user questions
  3. Web scraping engine (BeautifulSoup + httpx) to scrape website-specific results
  4. Tokenizer & TF-IDF style keyword retrieval
"""

import os
import re
from typing import List, Optional
from urllib.parse import urlparse

import httpx

try:
    from bs4 import BeautifulSoup
    _HAS_BS4 = True
except ImportError:
    _HAS_BS4 = False
    print("[RAG] WARNING: beautifulsoup4 not installed. Web scraping will be disabled.")


# ---------------------------------------------------------------------------
# Core Knowledge Documents
# ---------------------------------------------------------------------------
KNOWLEDGE_DOCS = [
    {
        "id": "overview",
        "title": "SharePlate Overview & Mission",
        "text": (
            "SharePlate is a real-time food rescue web application dedicated to the mission "
            "'Zero Waste. Maximum Impact.' It connects food donors (restaurants, caterers, "
            "hotels, and individuals) who have surplus edible food directly with verified "
            "NGOs and community shelters who can pick it up and distribute it to people in need, "
            "preventing good food from rotting in landfills. The platform supports three primary "
            "user roles: Food Donor (restaurant/individual), NGO (non-profit organization), "
            "and Platform Administrator. SharePlate is built with a React/Vite frontend, an "
            "Express.js backend with MongoDB for authentication, sessions, and NGO verification, "
            "and MySQL for real-time food donation posts."
        ),
    },
    {
        "id": "donor-workflow",
        "title": "Food Donor & Restaurant Workflow",
        "text": (
            "Food donors and restaurants register at /register by providing their name, email, "
            "phone number, full address, city, and pincode, verified via email OTP. Once logged in, "
            "they access the Restaurant Dashboard at /restaurant. Donors can create surplus food "
            "posts in under 30 seconds using the 'Post Surplus Food' form, specifying: food description "
            "(e.g., 50 boxed veg meals), estimated quantity (portions), pickup deadline (1, 2, 4, or 8 hours), "
            "instructions (e.g., 'enter via rear service gate'), and automated GPS pickup location. "
            "The dashboard displays 'Your Donations' tracking every post's real-time status: Available, "
            "Claimed, or Completed. When an NGO marks a pickup complete, the donor's totalDonations "
            "metric increments automatically."
        ),
    },
    {
        "id": "ngo-workflow",
        "title": "NGO Workflow & Claiming Food",
        "text": (
            "Non-profit organizations register at /register-ngo by submitting organizational details, "
            "DARPAN registration ID, address, and mandatory verification documents (Registration Certificate, "
            "PAN Card, Address Proof, and DARPAN Proof). After platform admin review and approval (status VERIFIED), "
            "the NGO logs in and accesses the NGO Dashboard at /ngo. The dashboard features the 'Live Food Feed' "
            "displaying all currently 'Available' food posts with portion counts, pickup deadlines, distance, and instructions. "
            "An NGO clicks 'Claim Food' to claim a donation, which shifts post status to 'Claimed' and links it to that NGO. "
            "The donation then appears in the NGO's 'Active Claims' panel. Once the NGO collects the food from the donor, "
            "they click 'Mark Picked Up', which transitions the post to 'Completed' and increments the NGO's pickupsCompleted count."
        ),
    },
    {
        "id": "admin-workflow",
        "title": "Admin Dashboard & Verification",
        "text": (
            "Platform administrators log in at /login (default admin: admin@shareplate.org) and access the Admin Dashboard "
            "at /admin. Admins have oversight of the platform: reviewing pending NGO registration applications, inspecting "
            "uploaded NGO certificates and DARPAN documents, approving (VERIFIED) or rejecting (REJECTED) NGO applications, "
            "activating or deactivating user accounts, and monitoring platform-wide food rescue statistics."
        ),
    },
    {
        "id": "post-status-lifecycle",
        "title": "Food Post Status Lifecycle",
        "text": (
            "Food posts progress through clear statuses: "
            "(1) 'Available': Newly published surplus food post waiting for an NGO to claim it. "
            "(2) 'Claimed': An NGO has reserved the food and is en route to pick it up before the deadline. "
            "(3) 'Completed': The NGO has collected the food and confirmed pickup via 'Mark Picked Up'. "
            "Upon completion, impact stats (total meals saved and completed pickups) are updated for both parties. "
            "(4) 'Expired': Posts whose pickup deadline passed before being claimed."
        ),
    },
    {
        "id": "impact-sustainability",
        "title": "Impact Metrics & Sustainability",
        "text": (
            "SharePlate computes verified sustainability and impact metrics: "
            "- Total Meals Donated: Cumulative portions of surplus food saved from waste. "
            "- Pickups Completed: Total rescue operations successfully executed by an NGO. "
            "- Reliability Score: Platform trust score starting at 5.0 reflecting adherence to commitments. "
            "- Carbon Offset: Diverting organic food waste from landfills avoids methane gas emissions, directly "
            "supporting UN Sustainable Development Goal 12.3 (halving food waste)."
        ),
    },
    {
        "id": "frontend-pages",
        "title": "SharePlate Website Navigation & Pages",
        "text": (
            "SharePlate includes the following public and protected web pages: "
            "- Home (/): Mission overview, real-time counter, dual registration buttons. "
            "- Restaurant Dashboard (/restaurant): Post surplus food and manage donation listings. "
            "- NGO Dashboard (/ngo): Browse Live Food Feed, claim available food, and complete active claims. "
            "- Admin Dashboard (/admin): Manage and verify NGO applications and view platform metrics. "
            "- Register Food Donor (/register): OTP-verified registration for restaurants and donors. "
            "- Register NGO (/register-ngo): Multi-step document submission for community non-profits. "
            "- Login (/login): Email and password login with automatic role-based redirect. "
            "- Milestones (/milestones): Community achievements and badges. "
            "- About Us (/about): The SharePlate origin story and core team. "
            "- Contact (/contact): Community support, inquiry form, and emergency assistance."
        ),
    },
]


# ---------------------------------------------------------------------------
# FAQ Documents
# ---------------------------------------------------------------------------
FAQ_DOCS = [
    {
        "id": "faq-how-to-register-donor",
        "title": "FAQ: How do I register as a restaurant or food donor?",
        "text": (
            "To register as a food donor, navigate to the Register page (/register). Enter your organization name, "
            "email address, phone number, physical address, city, pincode, and set a password. Click 'Send OTP' to receive "
            "a 6-digit verification code in your email. Enter the OTP and click 'Complete Registration'. You will be logged "
            "in immediately and redirected to your Restaurant Dashboard to start posting surplus food."
        ),
    },
    {
        "id": "faq-how-to-register-ngo",
        "title": "FAQ: How do I register as an NGO?",
        "text": (
            "To register as an NGO, visit /register-ngo. Complete the multi-step verification form providing: "
            "Organization Legal Name, Official Email, Phone, Address, City, Pincode, and DARPAN Registration ID. "
            "Upload 4 verification documents in PDF or PNG format: (1) NGO Registration Certificate, (2) PAN Card, "
            "(3) Address Proof, and (4) DARPAN Proof. After submission, platform administrators review your application "
            "within 10-15 business days. Once your application status is marked VERIFIED, you can log in and claim food."
        ),
    },
    {
        "id": "faq-how-to-post-food",
        "title": "FAQ: How do I post surplus food?",
        "text": (
            "Log in to your account at /login. You will be taken to your Restaurant Dashboard (/restaurant). Locate the "
            "'Post Surplus Food' section. Enter a clear description of the food (e.g. '30 packs of fresh rice & curry'), "
            "the quantity in portions, select a pickup deadline window (1 hour, 2 hours, 4 hours, or 8 hours), and add any "
            "helpful instructions like 'Pick up from side entrance'. Click 'Submit Post'. Your donation will instantly appear "
            "on the Live Food Feed for all verified local NGOs."
        ),
    },
    {
        "id": "faq-how-to-claim-food",
        "title": "FAQ: How does an NGO claim available food?",
        "text": (
            "Log in with your verified NGO account and visit the NGO Dashboard (/ngo). Look at the 'Live Food Feed' tab. "
            "Each card shows available surplus food with quantity, donor name, location, and time remaining. Click 'Claim Food' "
            "on any post you can collect. The post will move into your 'Active Claims' panel and show the donor's exact instructions. "
            "Proceed to the donor's location before the deadline expires."
        ),
    },
    {
        "id": "faq-after-pickup",
        "title": "FAQ: What should an NGO do after collecting the food?",
        "text": (
            "After physically receiving the food from the donor, open your NGO Dashboard (/ngo) and go to the 'Active Claims' "
            "section. Find the claimed post and click the green 'Mark Picked Up' button. This completes the rescue cycle, sets "
            "the post status to 'Completed', and credits your organization with a completed rescue while increasing the donor's "
            "total donated meals count."
        ),
    },
    {
        "id": "faq-what-food-allowed",
        "title": "FAQ: What types of food can be donated?",
        "text": (
            "SharePlate permits donations of wholesome, safe-to-consume surplus food. This includes prepared meals from "
            "restaurants, banquets, and catered events, baked goods, fresh fruits, vegetables, dairy products within their "
            "safe consumption period, and packaged food items. Food must be stored hygienically at proper temperatures before pickup. "
            "Expired food or food showing signs of spoilage is strictly prohibited."
        ),
    },
    {
        "id": "faq-pricing-cost",
        "title": "FAQ: Is SharePlate free to use?",
        "text": (
            "Yes! SharePlate is 100% free for all food donors, restaurants, caterers, and NGOs. There are zero subscription "
            "fees, zero commission, and zero listing charges. SharePlate is a non-profit sustainability initiative created to eliminate "
            "hunger and reduce greenhouse gases from food decomposition."
        ),
    },
    {
        "id": "faq-reliability-score",
        "title": "FAQ: How does the reliability score work?",
        "text": (
            "Every user starts with a default reliability score of 5.0 out of 5.0. Scores remain high when donors provide accurate "
            "descriptions and ensure food is ready at pickup time, and when NGOs promptly collect every food donation they claim "
            "before the deadline. Consistently completing pickups maintains high trust across the community network."
        ),
    },
    {
        "id": "faq-live-data-check",
        "title": "FAQ: Can I check live food listings or my account stats in the chat?",
        "text": (
            "Yes! You can ask this chatbot in real time: 'What food is available right now?', 'Show my donations', 'What have I claimed?', "
            "or 'What are the overall platform statistics?'. The assistant queries the live SharePlate database to give you current, "
            "up-to-the-minute numbers and listings."
        ),
    },
    {
        "id": "faq-contact-help",
        "title": "FAQ: How can I reach support or get help?",
        "text": (
            "You can contact the SharePlate team through the Contact page at /contact or email support directly at "
            "admin@shareplate.org. For urgent inquiries regarding an active food pickup, contact details are also provided "
            "on the active claim card."
        ),
    },
]

ALL_DOCS = KNOWLEDGE_DOCS + FAQ_DOCS


# ---------------------------------------------------------------------------
# Web Scraping Engine
# ---------------------------------------------------------------------------

_SCRAPER_USER_AGENT = "SharePlateBot/1.0 (https://shareplate.org; info@shareplate.org) Mozilla/5.0 (Windows NT 10.0; Win64; x64)"


def extract_urls(text: str) -> List[str]:
    """Find all http and https URLs in a text string."""
    pattern = r"https?://[^\s<>\"'{}|\\^`]+"
    matches = re.findall(pattern, text)
    valid_urls = []
    for url in matches:
        # Strip trailing punctuation often caught by regex
        cleaned = url.rstrip(".,;:!?)")
        try:
            parsed = urlparse(cleaned)
            if parsed.scheme in ("http", "https") and parsed.netloc:
                valid_urls.append(cleaned)
        except Exception:
            continue
    return valid_urls


def scrape_website(url: str, query: str = "", max_snippets: int = 5) -> List[dict]:
    """
    Scrape any target web URL and extract relevant text content for RAG.

    Args:
        url: The web page URL to fetch and scrape
        query: Optional question or query tokens to rank snippets by relevance
        max_snippets: Maximum number of text snippets to return (default 5)

    Returns:
        List of dicts: [{"title": "Web: ...", "text": "..."}]
    """
    if not _HAS_BS4:
        print("[RAG] Web scraping skipped: beautifulsoup4 not installed.")
        return []

    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https") or not parsed.netloc:
            print(f"[RAG] Invalid URL for scraping: {url}")
            return []
    except Exception as exc:
        print(f"[RAG] URL parsing error for {url}: {exc}")
        return []

    headers = {
        "User-Agent": _SCRAPER_USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    try:
        response = httpx.get(
            url,
            headers=headers,
            timeout=10.0,
            follow_redirects=True,
        )
        response.raise_for_status()
    except Exception as exc:
        print(f"[RAG] Web scrape request failed for {url}: {type(exc).__name__}: {exc}")
        return []

    try:
        soup = BeautifulSoup(response.text, "html.parser")

        # Determine page title
        page_title = ""
        if soup.title and soup.title.string:
            page_title = soup.title.string.strip()[:60]
        if not page_title:
            page_title = parsed.netloc

        # Strip uninformative elements
        for tag in soup(["script", "style", "nav", "footer", "header", "aside", "svg", "button", "input"]):
            tag.decompose()

        # Collect paragraphs and meaningful content blocks
        raw_blocks = []
        for element in soup.find_all(["p", "h1", "h2", "h3", "li", "article", "section"]):
            text = element.get_text(separator=" ", strip=True)
            if len(text) >= 30 and text not in raw_blocks:
                raw_blocks.append(text[:600])

        if not raw_blocks:
            body_text = soup.body.get_text(separator=" ", strip=True) if soup.body else ""
            if body_text:
                raw_blocks = [body_text[i:i+500] for i in range(0, min(len(body_text), 2000), 500)]

        # If a query was provided, score and sort snippets by keyword match
        query_tokens = set(tokenize(query)) if query else set()

        def _snippet_score(txt: str) -> int:
            if not query_tokens:
                return 1
            words = set(tokenize(txt))
            return len(words & query_tokens)

        scored = [(txt, _snippet_score(txt)) for txt in raw_blocks]
        if query_tokens:
            scored.sort(key=lambda x: x[1], reverse=True)

        results = []
        for txt, score in scored[:max_snippets]:
            results.append({
                "title": f"Web: {page_title} ({url[:50]})",
                "text": txt,
            })

        return results

    except Exception as exc:
        print(f"[RAG] Error parsing scraped HTML from {url}: {exc}")
        return []


# ---------------------------------------------------------------------------
# Retrieval & Tokenization
# ---------------------------------------------------------------------------

_STOPWORDS = {
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "to", "of", "in", "on", "at", "for", "with", "about", "as", "by",
    "and", "or", "but", "if", "so", "do", "does", "did", "can", "could",
    "will", "would", "should", "i", "you", "he", "she", "it", "we", "they",
    "my", "your", "his", "her", "its", "our", "their", "this", "that",
    "what", "when", "where", "who", "how", "why", "which", "not", "no",
    "yes", "just", "also", "very", "much", "more", "most", "some", "any",
}

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def tokenize(text: str) -> List[str]:
    """Split text into lowercase alphanumeric tokens excluding common stopwords."""
    tokens = _TOKEN_RE.findall(text.lower())
    return [t for t in tokens if t not in _STOPWORDS and len(t) > 1]


def _score_document(query_tokens: List[str], doc: dict) -> int:
    """Score a document with double weight for title token matches."""
    title_tokens = set(tokenize(doc.get("title", "")))
    text_tokens = set(tokenize(doc.get("text", "")))

    score = 0
    for token in query_tokens:
        if token in title_tokens:
            score += 3
        if token in text_tokens:
            score += 1
    return score


def retrieve_relevant_docs(question: str, top_k: int = 4) -> List[dict]:
    """
    Retrieve the top_k most relevant knowledge base and FAQ documents.
    Always ensures at least the Overview document is returned if no match is found.
    """
    query_tokens = tokenize(question)
    scored = [(doc, _score_document(query_tokens, doc)) for doc in ALL_DOCS]
    scored.sort(key=lambda pair: pair[1], reverse=True)

    relevant = [doc for doc, score in scored if score > 0][:top_k]

    if not relevant:
        overview = next((d for d in KNOWLEDGE_DOCS if d["id"] == "overview"), None)
        if overview:
            relevant = [overview]

    return relevant


def get_all_faqs() -> List[dict]:
    """Return all structured FAQ entries."""
    return [{"id": d["id"], "title": d["title"], "text": d["text"]} for d in FAQ_DOCS]
