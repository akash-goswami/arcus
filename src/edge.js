import Bezier from './bezier';
import { hashCode } from './utils';

const flattenToLine = (path) => {
    path = path.split(/\s+/);

    for (let i = 4, l = path.length; i < l; i++) {
        if (!(i % 2)) {
            path[i] = 0;
        }
    }

    return path.join(' ');
};

export default class Edge {
    constructor (from, to, key, meta) {
        this.from = from;
        this.to = to;
        this.key = key;
        this.meta = meta;
        this.sequence = null;
        this.shift = null;

        const path = meta.path;
        this._seqStr = `${path[0]}-${path[1]}`;
        this._seqHash = hashCode(this._seqStr);
        this._options = {
            path: this.constructor.pathOptions()
        };
        this._partOf = null;
        this._target = null;
        this.pathHist = [];
    }

    static pathOptions () {
        return {
            expansionFactor: 8,
            focus: Edge.FocusMode.NA,
            select: Edge.SelectMode.NA
        };
    }

    seqStr () {
        return this._seqStr;
    }

    seqHash () {
        return this._seqHash;
    }

    partOf (...params) {
        if (params.length) {
            this._partOf = params[0];
            return this;
        }

        return this._partOf;
    }

    pathOptions (...params) {
        if (params.length) {
            this._options.path = Object.assign({}, this._options.path, params[0]);
            return this;
        }

        return this._options.path;
    }

    jump () {
        return Math.abs(this.to.absOrder - this.from.absOrder);
    }

    path (control = { breathingSpace: 0 }) {
        const expFact = this._options.path.expansionFactor;
        const movement = this.sequence * expFact;
        const fpx = this.from.px();
        const tpx = this.to.px();
        const r = (tpx - fpx) * 0.75 + movement + control.breathingSpace + this.shift * 8;

        const inst = new Bezier(0, fpx, r, fpx, r, tpx, 0, tpx);
        const path = inst.toSVG();
        const hist = this.pathHist;

        if (hist.length === 0) {
            hist[0] = { path: flattenToLine(path) };
        } else {
            hist[0] = hist[1];
        }
        hist[1] = { path, inst };

        return [path, this];
    }

    r (control = { breathingSpace: 0 }) {
        const expFact = this._options.path.expansionFactor;
        const movement = this.sequence * expFact;
        const fpx = this.from.px();
        const tpx = this.to.px();
        return (tpx - fpx) * 0.75 + movement + control.breathingSpace + this.shift * 8;
    }

    reversePath (control = { breathingSpace: 0 }) {
        const expFact = this._options.path.expansionFactor;
        const movement = this.sequence * expFact;
        const fpx = this.from.px();
        const tpx = this.to.px();
        const r = (tpx - fpx) * 0.75 + movement + control.breathingSpace + this.shift * 8;

        return [new Bezier(0, tpx, r, tpx, r, fpx, 0, fpx).toSVG(), this];
    }

    distance (point) {
        return this.pathHist[1].inst.project({
            x: point[0],
            y: point[1]
        });
    }
}

Edge.FocusMode = {
    FOCUSED: 1,
    UNFOCUSED: -1,
    NA: 0,
};

Edge.SelectMode = {
    ON: 1,
    OFF: -1,
    NA: 0
};
