import { edgeOrderCode } from './utils';

const direction = edges => edgeOrderCode(edges[0]);

export default class Shadow {
    constructor (edges) {
        this.edges = edges;
        this.direction = direction(edges);
    }

    spread () {
        return Math.abs(this.edges[this.edges.length - 1].r());
    }

    path () {
        const edges = this.edges;
        return [[
            edges[0].path()[0],
            edges[edges.length - 1].reversePath({ breathingSpace: 8 })[0].replace(/M/g, 'L'),
            'Z'
        ].join(' '), edges[0]];
    }
}
