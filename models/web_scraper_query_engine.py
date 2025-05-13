import os
import requests
from bs4 import BeautifulSoup
from llama_index.core.query_engine import CustomQueryEngine
from llama_index.llms.google_genai import GoogleGenAI
from pydantic import Field
from fastapi import HTTPException
import random
import urllib3
from cachetools import TTLCache
import logging

# Thiết lập logging để debug hiệu suất
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Vô hiệu hóa cảnh báo SSL (chỉ dùng trong môi trường phát triển)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class Config:
    max_number_of_posts = 5
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    REQUEST_TIMEOUT = 10  # Timeout 10 giây cho mỗi request
    CACHE_TTL = 3600  # Cache sống 1 giờ

# Khởi tạo cache
articles_cache = TTLCache(maxsize=1, ttl=Config.CACHE_TTL)
content_cache = TTLCache(maxsize=100, ttl=Config.CACHE_TTL)

class WebScraperQueryEngine(CustomQueryEngine):
    """Custom query engine for scraping IELTS vocabulary articles from ielts-fighter.com."""

    llm: GoogleGenAI | None = Field(default=None)

    # def fetch_articles(self, custom_url=None):
    #     """Lấy danh sách bài viết từ ielts-fighter.com hoặc URL tùy chỉnh, sử dụng cache nếu có."""
    #     # Nếu có URL tùy chỉnh, chỉ lấy bài viết từ URL đó
    #     if custom_url:
    #         logger.info(f"Fetching article from custom URL: {custom_url}")
    #         try:
    #             response = requests.get(custom_url, verify=False, timeout=Config.REQUEST_TIMEOUT)
    #             response.raise_for_status()
                
    #             # Phân tích HTML
    #             soup = BeautifulSoup(response.text, 'html.parser')
    #             print(soup)
    #             # Lấy tiêu đề
    #             title = soup.find('h1', class_='post-title')
    #             if not title:
    #                 title = soup.find('h1')  # Thử tìm bất kỳ thẻ h1 nào
    #             title = title.text.strip() if title else 'Untitled Article'
                
    #             # Tạo một bài viết duy nhất
    #             article = {
    #                 'key': 1,
    #                 'title': title,
    #                 'link': custom_url,
    #                 'content': soup.get_text(separator='\n', strip=True)
    #             }
                
    #             return [article]
                
    #         except requests.RequestException as e:
    #             logger.error(f"Error fetching custom URL: {str(e)}")
    #             raise HTTPException(status_code=500, detail=f"Error fetching custom URL: {str(e)}")

    #     # Kiểm tra cache cho URL mặc định
    #     if 'articles' in articles_cache:
    #         logger.info("Fetching articles from cache")
    #         return articles_cache['articles']

    #     url = "https://ielts-fighter.com/tin-tuc/vocab_c13.html?page=1"
    #     logger.info(f"Fetching articles from {url}")

    #     try:
    #         response = requests.get(url, verify=False, timeout=Config.REQUEST_TIMEOUT)
    #         response.raise_for_status()
    #     except requests.RequestException as e:
    #         logger.error(f"Error fetching articles: {str(e)}")
    #         raise HTTPException(status_code=500, detail=f"Error fetching articles: {str(e)}")

    #     # Phân tích HTML chỉ trong phần chứa bài viết
    #     soup = BeautifulSoup(response.text, 'html.parser')
    #     articles = soup.find_all('article', class_='card card-post shadow-none bg-light')[:Config.max_number_of_posts]

    #     article_list = []
    #     for idx, article in enumerate(articles, 1):
    #         title_tag = article.find('h6', class_='card-title').find('a')
    #         title = title_tag.text.strip()
    #         link = title_tag['href']
            
    #         # Fetch content for each article
    #         try:
    #             article_response = requests.get(link, verify=False, timeout=Config.REQUEST_TIMEOUT)
    #             article_response.raise_for_status()
    #             article_soup = BeautifulSoup(article_response.text, 'html.parser')
    #             content = article_soup.get_text(separator='\n', strip=True)
    #         except:
    #             content = ""

    #         article_list.append({
    #             'key': idx,
    #             'title': title,
    #             'link': link,
    #             'content': content
    #         })

    #     # Lưu vào cache
    #     articles_cache['articles'] = article_list
    #     logger.info("Articles cached successfully")
    #     return article_list

    def custom_query(self, query_str: str, custom_url: str = None):
        """Xử lý truy vấn người dùng dựa trên bài viết được cào."""
        logger.info(f"Processing query: {query_str}")
        # Lấy danh sách bài viết
        # articles = self.fetch_articles(custom_url)
        if(custom_url):
            response = requests.get(custom_url, verify=False, timeout=Config.REQUEST_TIMEOUT)
            response.raise_for_status()
                    
                    # Phân tích HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            # if not articles:
            #     logger.error("No articles found")
            #     raise HTTPException(status_code=404, detail="No articles found")

            # # Nếu có URL tùy chỉnh, sử dụng bài viết đầu tiên
            # selected_article = articles[0] if custom_url else random.choice(articles)
            
            # Tạo prompt cho LLM
            prompt = (
                f"Based on the following article content, please answer the user's question about IELTS vocabulary.\n\n"
                f"User's question: {query_str}\n\n"
                # f"Article title: {selected_article['title']}\n"
                # f"Article content:\n{selected_article['content']}\n\n"
                f"Content:\n{soup}\n"
                # f"Please provide a detailed answer focusing on IELTS vocabulary. Format your response as follows:\n\n"
                # f"## VOCABULARY LIST\n"
                # f"- **Word 1**: [Definition]\n"
                # f"- **Word 2**: [Definition]\n"
                # f"- **Word 3**: [Definition]\n"
                # f"## EXAMPLE SENTENCES\n"
                # f"- [Example sentence 1]\n"
                # f"- [Example sentence 2]\n"
                # f"## USAGE NOTES\n"
                # f"- [Note 1]\n"
                # f"- [Note 2]\n"
                # f"## RELATED VOCABULARY\n"
                # f"- **Related word 1**: [Brief explanation]\n"
                # f"- **Related word 2**: [Brief explanation]\n"
                # f"Please ensure each section is clearly separated and formatted with proper markdown syntax."
            )
        else:
            prompt = (
                f"User's question: {query_str}\n"
                # f"Article title: {selected_article['title']}\n"
                # f"Article content:\n{selected_article['content']}\n\n"
            )
        # Gọi LLM
        try:
            logger.info("Calling LLM for response")
            answer = self.llm.complete(prompt)
            return {
                # "selected_article": {
                #     "title": selected_article['title'],
                #     "link": selected_article['link']
                # },
                "response": str(answer)
            }
        except Exception as e:
            logger.error(f"Error processing query with LLM: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing query with LLM: {str(e)}")