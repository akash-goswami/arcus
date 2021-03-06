const drawText = (mount, text, options) => {
    let sel = mount.selectAll(`text.${options.cls}`).data([text]);
    sel.exit().remove();
    sel = sel.enter().append('text').classed(options.cls, true).attr('y', options.shiftY ? options.shiftY : 0);

    sel = sel.selectAll('tspan').data(d => d);
    sel.exit().remove();
    sel.enter().append('tspan').attr('dy', 16).attr('x', 0).merge(sel).text(d => d);

    return 16 * text.length;
};


const drawMarks = (mount, nodes, config) => {
    let sel = mount.selectAll('line').data([config.frameLength]);
    sel.exit().remove();
    sel = sel.enter().append('line').attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', d => d)
        .classed('arcus-frame-line', true);

    sel = mount.selectAll('circle').data(nodes);
    sel.exit().remove();
    sel = sel.enter().append('circle').attr('cx', 0).attr('cy', (d, i) => i * config.nodeSpacing)
        .attr('r', node => node.config.size).classed('arcus-frame-node', true).style('fill', d => d.config.color);
    return sel;
};

export default class Frame {
    constructor (source, nodes, order, dependencies) {
        this.source = source;
        this.nodes = nodes;
        this.order = order;
        this.offset = null;
        this._mount = null;
        this._dep = dependencies;

        nodes.forEach((node) => {
            node.association = this;
            node.pOrder = order;
            node.absOrder = order * this.nodes.length + node.order;
        });

        const sl = this._dep.sl;

        this._dims = {};

        sl.setStyle({
            fontFamily: 'Roboto, sans-serif',
            fontSize: '16px',
            fontWeight: 700,
            fontStyle: 'normal'
        });
        this._dims.head = sl.getOriSize(source.name);

        sl.setStyle({
            fontFamily: 'Roboto, sans-serif',
            fontSize: '16px',
            fontWeight: 300,
            fontStyle: 'normal'
        });
        this._dims.desc = sl.getOriSize(source.desc || '');
    }

    getLabelSize () {
        return Math.max(this._dims.head.width, this._dims.desc.width);
    }

    draw (mount, config) {
        const sl = this._dep.sl;
        const source = this.source;
        this._mount = mount;
        const labelCls = 'arcus-frame-label';

        let sel = mount.selectAll(`g.${labelCls}`).data([1]);
        sel.exit().remove();
        sel = sel.enter().append('g').classed(labelCls, true);

        // Draw header
        let lines = sl.constructor.textToLines(sl.getSmartText(source.name, config.labelBBox.width)).lines;
        const height = drawText(sel, lines, { cls: `${labelCls}-head` });

        // Draw desc
        lines = sl.constructor.textToLines(sl.getSmartText(source.desc, config.labelBBox.width)).lines;
        drawText(sel, lines, { cls: `${labelCls}-desc`, shiftY: height + 8 /* mandatory padding */});

        sel = mount.selectAll('g.arcus-frame-marks').data([1]);
        sel.exit().remove();
        sel = sel.enter().append('g').classed('arcus-frame-marks', true)
            .attr('transform', `translate(${config.labelBBox.width}, 0)`);

        drawMarks(sel, this.nodes, config);
    }

    postDrawingAdjust (adjustment) {
        this._mount.selectAll('g.arcus-frame-label').attr('transform', `translate(${adjustment.offsetX}, 0)`);
    }
}
