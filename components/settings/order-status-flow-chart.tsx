"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface OrderStatus {
  id: string
  name: string
  color: string
  isDefault: boolean
  isActive: boolean
}

interface WorkflowRule {
  id: string
  fromStatus: string
  toStatus: string
  triggerType: "manual" | "event" | "time"
  triggerCondition: string | null
  requireApproval: boolean
  approvalRoles: string[]
  notifyRoles: string[]
  isActive: boolean
}

interface OrderStatusFlowChartProps {
  statuses: OrderStatus[]
  workflowRules: WorkflowRule[]
}

export function OrderStatusFlowChart({ statuses, workflowRules }: OrderStatusFlowChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // 過濾出活躍的規則和狀態
    const activeStatuses = statuses.filter((status) => status.isActive)
    const activeRules = workflowRules.filter((rule) => rule.isActive)

    // 清除之前的圖表
    d3.select(svgRef.current).selectAll("*").remove()

    // 設置圖表尺寸
    const width = 800
    const height = 400
    const nodeRadius = 30
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;")

    // 創建節點數據
    const nodes = activeStatuses.map((status) => ({
      id: status.id,
      name: status.name,
      color: status.color,
      isDefault: status.isDefault,
    }))

    // 創建連接數據
    const links = activeRules.map((rule) => ({
      source: rule.fromStatus,
      target: rule.toStatus,
      type: rule.triggerType,
    }))

    // 創建力導向圖佈局
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d: any) => d.id)
          .distance(150),
      )
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))

    // 繪製連接線
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrowhead)")

    // 添加箭頭標記
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 30)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999")

    // 繪製節點
    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag<SVGGElement, any>().on("start", dragstarted).on("drag", dragged).on("end", dragended) as any)

    // 添加節點圓圈
    node
      .append("circle")
      .attr("r", nodeRadius)
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)

    // 添加節點文字
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "#fff")
      .text((d) => d.name)
      .attr("font-size", "10px")

    // 添加連接線文字
    svg
      .append("g")
      .selectAll("text")
      .data(links)
      .join("text")
      .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
      .attr("y", (d: any) => (d.source.y + d.target.y) / 2)
      .attr("text-anchor", "middle")
      .attr("dy", -5)
      .attr("fill", "#666")
      .text((d) => {
        switch (d.type) {
          case "manual":
            return "手動"
          case "event":
            return "事件"
          case "time":
            return "時間"
          default:
            return d.type
        }
      })
      .attr("font-size", "10px")

    // 更新力導向圖佈局
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`)
    })

    // 拖拽功能
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: any) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [statuses, workflowRules])

  return (
    <div className="flex justify-center overflow-auto">
      <svg ref={svgRef} className="border rounded-md"></svg>
    </div>
  )
}
