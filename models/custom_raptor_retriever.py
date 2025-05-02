from llama_index.packs.raptor import RaptorRetriever
from typing import Optional, List
from llama_index.core.base.base_retriever import QueryType
from llama_index.packs.raptor.base import QueryModes
from llama_index.core.schema import NodeWithScore, QueryBundle
from llama_index.core.base.response.schema import Response
from llama_index.core.vector_stores.types import MetadataFilters, MetadataFilter
class CustomRaptorRetriever(RaptorRetriever):

    def retrieve(
        self, query_str_or_bundle: QueryType, mode: Optional[QueryModes] = None
    ) -> List[NodeWithScore]:
        """Retrieve nodes given query and mode."""
        if isinstance(query_str_or_bundle, QueryBundle):
            query_str = query_str_or_bundle.query_str
        else:
            query_str = query_str_or_bundle

        return  self.aretrieve(query_str, mode or self.mode)


    def collapsed_retrieval(self, query_str: str) -> List[NodeWithScore]:
        """Query the index as a collapsed tree -- i.e. a single pool of nodes."""
        # retriver = (CustomRaptorRetriever) self.index.as_retriever(similarity_top_k=self.similarity_top_k)
        return self.index.as_retriever(similarity_top_k=self.similarity_top_k).aretrieve(query_str)

    def tree_traversal_retrieval(self, query_str: str) -> List[NodeWithScore]:
        """Query the index as a tree, traversing the tree from the top down."""
        # get top k nodes for each level, starting with the top
        parent_ids = None
        selected_node_ids = set()
        selected_nodes = []
        level = self.tree_depth - 1
        while level >= 0:
            # retrieve nodes at the current level
            if parent_ids is None:
                nodes = self.index.as_retriever(
                    similarity_top_k=self.similarity_top_k,
                    filters=MetadataFilters(
                        filters=[MetadataFilter(key="level", value=level)]
                    ),
                ).aretrieve(query_str)

                for node in nodes:
                    if node.id_ not in selected_node_ids:
                        selected_nodes.append(node)
                        selected_node_ids.add(node.id_)

                parent_ids = [node.id_ for node in nodes]
                if self._verbose:
                    print(f"Retrieved parent IDs from level {level}: {parent_ids!s}")
            # retrieve nodes that are children of the nodes at the previous level
            elif parent_ids is not None and len(parent_ids) > 0:
                nodes = []
                for id_ in parent_ids:
                    child_nodes = self.index.as_retriever(
                        similarity_top_k=self.similarity_top_k,
                        filters=MetadataFilters(
                            filters=[MetadataFilter(key="parent_id", value=id_)]
                        ),
                    ).aretrieve(query_str)

                    nodes.extend(child_nodes)

                for node in nodes:
                    if node.id_ not in selected_node_ids:
                        selected_nodes.append(node)
                        selected_node_ids.add(node.id_)

                if self._verbose:
                    print(f"Retrieved {len(nodes)} from parents at level {level}.")

                level -= 1
                parent_ids = None

        return selected_nodes

    def aretrieve(
            self, query_str_or_bundle: QueryType, mode: Optional[QueryModes] = None
    ) -> List[NodeWithScore]:
        """Retrieve nodes given query and mode."""
        if isinstance(query_str_or_bundle, QueryBundle):
            query_str = query_str_or_bundle.query_str
        else:
            query_str = query_str_or_bundle

        mode = mode or self.mode
        if mode == "tree_traversal":
            return self.tree_traversal_retrieval(query_str)
        elif mode == "collapsed":
            return self.collapsed_retrieval(query_str)
        else:
            raise ValueError(f"Invalid mode: {mode}")