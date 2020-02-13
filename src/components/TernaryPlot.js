import React, { Component } from 'react';
import { range } from 'd3-array';
import areasJson from '../data/areas.json'

class TernaryPlot extends Component {
  constructor(props) {
    super(props);
    this.height = 640;
    this.width = 640;
    this.radius = Math.min(this.width, this.height) / 2;
    this.yOffset = (this.radius - Math.sin(30 * Math.PI / 180) * this.radius) / 2;
    this.labelOffset = 20;
    this.verticesAngles = [-90, 150, 30]
    this.verticesNames = ["Q", "A", "P"]
    this.vertices = this.getVertices();
    this.labelVertices = this.getVertices(this.labelOffset);
    this.edges = this.getEdges(this.vertices)
    this.labelEdges = this.getEdges(this.labelVertices)
    this.ticks = range(20, 100, 20).concat(100);
    this.grid = range(0, 1, 0.1);
  }
  static line([x1, y1], [x2, y2]) {
    return (t) => {
      return [
        x1 + t * (x2 - x1),
        y1 + t * (y2 - y1)
      ]
    }
  }
  getVertices(offset = 0) {
    return this.verticesAngles.map( d => [
      Math.cos(d * Math.PI / 180) * (this.radius + offset),
      Math.sin(d * Math.PI / 180) * (this.radius + offset) + this.yOffset
    ])
  }
  getEdges(vertices) {
    let _vertices = Array.from(vertices)
    return _vertices.map(() => {
      _vertices.push(_vertices.shift());
      return this.constructor.line(_vertices[0], _vertices[1])
    })
  }
  render() {
    return (
      <svg height={this.height} width={this.width}>
        <g
          transform={`translate(${this.width / 2} ${this.height / 2})`}
          fontFamily="sans-serif"
        >
          <path
            d={`M${this.vertices[0]}L${this.vertices[1]}L${this.vertices[2]}Z`}
            fill="#ececec"
            stroke="none"
          />
          <g>
            {[
              this.grid.map(tick => [this.edges[0](tick), this.edges[1](1 - tick)]),
              this.grid.map(tick => [this.edges[1](tick), this.edges[2](1 - tick)]),
              this.grid.map(tick => [this.edges[2](tick), this.edges[0](1 - tick)]),
            ].map((gridLines, i) => (
              <g key={i}>
                {gridLines.map((lineVertices, i) => (
                  <line
                    key={i}
                    x1={lineVertices[0][0]}
                    y1={lineVertices[0][1]}
                    x2={lineVertices[1][0]}
                    y2={lineVertices[1][1]}
                    stroke="#fff"
                    strokeWidth={ i & 1 ? 1 : 2}
                  />
                ))}
              </g>
            ))}
          </g>
          <g fontSize={10}>
            {[
              this.ticks.map(tick => (
                {tick, pos: this.edges[0](tick / 100), rot: -60, anchor: "end"}
              )),
              this.ticks.map(tick => (
                {tick, pos: this.edges[1](tick / 100), rot: 0, anchor: "start"}
              )),
              this.ticks.map(tick => (
                {tick, pos: this.edges[2](tick / 100), rot: 60, anchor: "end"}
              )),
            ].map((ticks, i) => (
              <g key={i}>
                {ticks.map((tick, i) => (
                  <text
                    key={i}
                    transform={`translate(${tick.pos}) rotate(${tick.rot})`}
                    textAnchor={tick.anchor}
                    dx={10 * (tick.anchor === "start" ? 1 : -1)}
                    dy=".3em"
                  >
                    {tick.tick}
                  </text>
                ))}
              </g>
            ))}
          </g>
          <g
            fontSize={20}
            fontWeight={700}
          >
            {[
              {label: this.verticesNames[0], pos: this.labelVertices[0]},
              {label: this.verticesNames[1], pos: this.labelVertices[1]},
              {label: this.verticesNames[2], pos: this.labelVertices[2]}
            ].map((label, i) => (
              <text
                key={i}
                transform={`translate(${label.pos})`}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {label.label}
              </text>
            ))}
          </g>
          <g>
            {Object.entries(areasJson).map(([key, value]) => ({
              label: key,
              color: value.color,
              nodes: value.nodes.map((node) => {
                const pct = Object.values(node)
                let x = 0
                let y = 0
                this.vertices.forEach((v, i) => {
                  x += v[0] * pct[i] / 100
                  y += v[1] * pct[i] / 100
                })
                return [x, y]
              })
            })).map((area,i) => {
              let path = `M${area.nodes[0]}`
              area.nodes.slice(1).forEach((p) => { path+= `L${p}`})
              path += "Z"
              return (
                <path
                  key={i}
                  d={path}
                  fill={area.color}
                  fillOpacity={0.6}
                  stroke="#fff"
                >
                  <title>{area.label}</title>
                </path>
              )
            })}
          </g>
        </g>
      </svg>
    )
  }
}

export default TernaryPlot;
