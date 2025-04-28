from llama_index.packs.raptor import RaptorRetriever
from typing import Optional, List
from llama_index.core.base.base_retriever import QueryType
from llama_index.packs.raptor.base import QueryModes
from llama_index.core.schema import NodeWithScore, QueryBundle
import asyncio
class CustomRaptorRetriever(RaptorRetriever):
    async def retrieve(
        self, query_str_or_bundle: QueryType, mode: Optional[QueryModes] = None
    ) -> List[NodeWithScore]:
        """Retrieve nodes given query and mode."""
        if isinstance(query_str_or_bundle, QueryBundle):
            query_str = query_str_or_bundle.query_str
        else:
            query_str = query_str_or_bundle

        return await self.aretrieve(query_str, mode or self.mode)
