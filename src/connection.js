import Bezier from './bezier';
import { edgeOrderCode, EdgeDirection } from './utils';

const orderEdges = (edges) => {
    const resp = { forward: [], backward: [] };
    edges.forEach((edge) => {
        const status = edgeOrderCode(edge);
        if (status === EdgeDirection.FORWARD) {
            resp.forward.push(edge);
        } else {
            resp.backward.push(edge);
        }
    });

    return resp;
};

export default class Connection {
    constructor (edges) {
        this.directions = orderEdges(edges);
        this.sequence = null;
    }

    path () {
        return {
            forward: this.directions.forward.map((edge) => {
                const movement = edge.sequence * 8;
                const fpx = edge.from.px();
                const tpx = edge.to.px();
                const r = (tpx - fpx) / 2 + movement;
                return new Bezier(0, fpx, r, fpx + movement, r, tpx - movement, 0, tpx).toSVG();
            }).join(' ')
        };
    }
}
