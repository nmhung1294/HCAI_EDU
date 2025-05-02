from llama_index.core.query_engine import CustomQueryEngine
from llama_index.llms.google_genai import GoogleGenAI
from pydantic import Field
from models.config import *
import requests
from bs4 import BeautifulSoup


class WebScraperQueryEngine(CustomQueryEngine):
    """Custom query engine for web scraping."""

    llm: GoogleGenAI | None = Field(default=None)

    # web scraper
    def fetch_articles(self):
        url_fipu = selected_web_url
        response = requests.get(url_fipu, verify=False)
        response.raise_for_status()

        limit = max_number_of_posts

        soup = BeautifulSoup(response.text, 'html.parser')

        news_container = soup.select(
            'div.scrollable_content div.container div.row div.col-lg-9 div#area_middle div#cms_area_middle div.cms_module.portlet_news div.cms_module_html div.news.Default_news_layout.news_layout_type_default')

        articles = []

        for article in news_container:
            news_articles = article.find_all('div', class_='news_article card news_priority_5 image_left')
            for idx, news in enumerate(news_articles):
                if limit and len(articles) >= limit:
                    break
                title = news.find('div', class_='news_title_truncateable').text.strip()
                link = news.find('a')['href']
                pub_date = news.find('div', class_='news_pub_date').find('time')['datetime']
                author = news.find('div', class_='author_name').text.strip() if news.find('div',
                                                                                          'author_name') else 'N/A'
                image = news.find('img', class_='news_lead_image')['src'] if news.find('img',
                                                                                       'news_lead_image') else 'N/A'
                summary = news.find('div', class_='news_lead_small').text.strip()

                articles.append({
                    'key': idx + 1,
                    'title': title,
                    'link': link,
                    'pub_date': pub_date,
                    'author': author,
                    'image': image,
                    'summary': summary
                })

                print(
                    f"Key: {idx + 1}\nTitle: {title}\nLink: {link}\nPublication Date: {pub_date}\nAuthor: {author}\nImage: {image}\nSummary: {summary}\n")

            if limit and len(articles) >= limit:
                break

        return articles

    def custom_query(self, query_str: str):
        articles = self.fetch_articles()
        articles_text = '\n'.join(
            [f"Key: {article['key']}\nTitle: {article['title']}\nSummary: {article['summary']}" for article in
             articles])
        print("articles_text: ", articles_text)
        prompt = f"Answer the user question: {query_str} based on the latest news listed here: {articles_text}."
        answer = llm.complete(prompt)

        return str(answer)