import { useCallback, useRef } from 'react';
import ReactFlow, {
  ConnectionLineType,
  NodeOrigin,
  OnConnectEnd,
  OnConnectStart,
  useReactFlow,
  useStoreApi,
} from 'reactflow';
import shallow from 'zustand/shallow';

import useStore, { RFState } from '../store';
import MindMapNode from './MindMapNode';
import MindMapEdge from './MindMapEdge';

import 'reactflow/dist/style.css';

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  addChildNode: state.addChildNode,
});

const nodeTypes = {
  mindmap: MindMapNode,
};
const edgeTypes = {
  mindmap: MindMapEdge,
};

const nodeOrigin: NodeOrigin = [0.5, 0.5];

const connectionLineStyle = { stroke: '#F6AD55', strokeWidth: 3 };
const defaultEdgeOptions = { style: connectionLineStyle, type: 'mindmap' };

function Flow() {
  const store = useStoreApi();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addChildNode,
  } = useStore(selector, shallow);
  const { project } = useReactFlow();
  const connectingNodeId = useRef<string | null>(null);

  const onConnectStart: OnConnectStart = useCallback((_, { nodeId }) => {
    connectingNodeId.current = nodeId;
  }, []);

  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const { domNode, nodeInternals } = store.getState();
      const targetIsPane = (event.target as Element).classList.contains(
        'react-flow__pane'
      );

      if (targetIsPane && domNode && connectingNodeId.current) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const { top, left } = domNode.getBoundingClientRect();
        const parentNode = nodeInternals.get(connectingNodeId.current) || null;

        addChildNode(
          parentNode,
          project({
            x: event.clientX - left,
            y: event.clientY - top,
          })
        );
      }
    },
    [project]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnectStart={onConnectStart}
      onConnect={onConnect}
      onConnectEnd={onConnectEnd}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodeOrigin={nodeOrigin}
      defaultEdgeOptions={defaultEdgeOptions}
      connectionLineStyle={connectionLineStyle}
      connectionLineType={ConnectionLineType.Straight}
      fitView
    />
  );
}

export default Flow;