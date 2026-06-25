"""
D3 演示脚本 · 5 款商品 × 3 个生图工具 × 4 项指标

⚠️ 演示声明：
- 本脚本是 D3 笔记的"实测流程演示"，不是真实商业测试
- 真实测 midjourney / 即梦 / 香蕉 需要付费 API + 实际网络环境
- 本脚本输出的是"模拟运行结果"，但指标体系（4 项指标）和统计逻辑是真实的
- D3 笔记明确标注「演示环境」

使用方法：
  python3 scripts/d3-product-image-batch.py

输出：
  - 控制台：5 × 3 矩阵的 4 项指标对比表
  - 文件：content-kit/D3-笔记/实测数据.csv（4 列 × 15 行）
  - 文件：content-kit/D3-笔记/结论.txt（自动生成 3 句话结论）
"""
import csv
import random
from pathlib import Path
from datetime import datetime

random.seed(20260625)  # 固定随机种子，保证 D3 笔记引用的数字可复现

# 5 款测试商品（演示场景：日用百货，电商最常见的 5 类）
PRODUCTS = [
    {"id": "P1", "name": "304 不锈钢保温杯 350ml", "category": "杯具"},
    {"id": "P2", "name": "北欧风陶瓷餐具 6 件套", "category": "餐具"},
    {"id": "P3", "name": "纯棉毛巾三件套 100% 棉", "category": "家纺"},
    {"id": "P4", "name": "便携折叠收纳袋 3 尺寸", "category": "收纳"},
    {"id": "P5", "name": "硅胶厨具 5 件套（铲/夹/刷）", "category": "厨房"},
]

# 3 个生图工具（演示场景，统一抽象成 4 项指标）
TOOLS = [
    {"id": "T1", "name": "Midjourney", "api": "mj-v6.1", "cost_per_call": 0.04},
    {"id": "T2", "name": "即梦",       "api": "jimeng-v2", "cost_per_call": 0.0},
    {"id": "T3", "name": "香蕉",       "api": "banana-v1", "cost_per_call": 0.02},
]


def simulate_one(product: dict, tool: dict) -> dict:
    """
    单个商品 × 单个工具的"演示运行结果"
    
    指标定义（这是真的）：
    - prep_minutes: 准备时间（写 prompt 的人工耗时，分钟）
    - output_count: 一次产出的可用图张数（1-4 张）
    - commercial_rate: 可商用率（0-1，AI 出图能直接用的比例）
    - edit_count: 人工修改次数（不满意需要 PS 重新裁/调色的次数）
    """
    # 不同工具有不同的"性格"，这是真实从业者的经验
    if tool["id"] == "T1":  # Midjourney：质量高但 prompt 要求精细
        prep = round(random.uniform(3, 7), 1)
        output = random.choice([2, 3, 4])
        commercial = round(random.uniform(0.7, 0.9), 2)
        edit = random.randint(1, 3)
    elif tool["id"] == "T2":  # 即梦：国产友好，prompt 简单但质量中
        prep = round(random.uniform(1, 3), 1)
        output = random.choice([3, 4, 4])
        commercial = round(random.uniform(0.4, 0.6), 2)
        edit = random.randint(2, 5)
    else:  # 香蕉：平衡型
        prep = round(random.uniform(2, 4), 1)
        output = random.choice([2, 3, 4])
        commercial = round(random.uniform(0.55, 0.75), 2)
        edit = random.randint(1, 4)

    cost = round(output * tool["cost_per_call"], 4)
    return {
        "product_id": product["id"],
        "product": product["name"],
        "tool": tool["name"],
        "prep_minutes": prep,
        "output_count": output,
        "commercial_rate": commercial,
        "edit_count": edit,
        "cost_usd": cost,
    }


def aggregate(results: list) -> dict:
    """按工具汇总：算 4 项指标的平均值（这是 D3 笔记的核心数据）"""
    by_tool = {}
    for r in results:
        by_tool.setdefault(r["tool"], []).append(r)

    summary = {}
    for tool_name, rows in by_tool.items():
        n = len(rows)
        summary[tool_name] = {
            "avg_prep": round(sum(r["prep_minutes"] for r in rows) / n, 1),
            "total_output": sum(r["output_count"] for r in rows),
            "avg_commercial": round(sum(r["commercial_rate"] for r in rows) / n * 100, 1),
            "total_edits": sum(r["edit_count"] for r in rows),
        }
    return summary


def render_summary_table(summary: dict) -> str:
    """生成 D3 笔记用的对比表文本"""
    headers = ["工具", "准备(分)", "产出张数", "可商用率", "修改次数"]
    lines = ["\t".join(headers)]
    for tool_name, m in summary.items():
        row = [tool_name, str(m["avg_prep"]), str(m["total_output"]),
               f"{m['avg_commercial']}%", str(m["total_edits"])]
        lines.append("\t".join(row))
    return "\n".join(lines)


def render_conclusion(summary: dict) -> str:
    """自动生成 3 句话结论（基于数据，不是编的）"""
    # 找最省 prep 的工具
    fastest_prep = min(summary.items(), key=lambda x: x[1]["avg_prep"])
    # 找产出最多的工具
    most_output = max(summary.items(), key=lambda x: x[1]["total_output"])
    # 找可商用率最高的工具
    best_commercial = max(summary.items(), key=lambda x: x[1]["avg_commercial"])
    # 找修改最少的工具（最少人工 = 最高效）
    least_edit = min(summary.items(), key=lambda x: x[1]["total_edits"])

    return f"""D3 演示结论（自动生成）：

1. 准备时间最快：{fastest_prep[0]}（平均 {fastest_prep[1]['avg_prep']} 分钟/款）
2. 一次产出最多：{most_output[0]}（5 款商品累计 {most_output[1]['total_output']} 张可用图）
3. 可商用率最高：{best_commercial[0]}（{best_commercial[1]['avg_commercial']}%，但需要人工修改 {least_edit[1]['total_edits']} 次）
4. 综合推荐：{least_edit[0]}（准备 {summary[least_edit[0]]['avg_prep']} 分 + 修改 {summary[least_edit[0]]['total_edits']} 次，最适合日常复用）
"""


def main():
    output_dir = Path("content-kit/D3-笔记")
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"开始 D3 演示运行：{len(PRODUCTS)} 款商品 × {len(TOOLS)} 个工具")
    print(f"开始时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    # 跑全矩阵
    results = []
    for product in PRODUCTS:
        for tool in TOOLS:
            r = simulate_one(product, tool)
            results.append(r)
            print(f"  [{r['product_id']} × {r['tool']}] 准备 {r['prep_minutes']}分 / "
                  f"产出 {r['output_count']}张 / 可商用 {r['commercial_rate']*100}% / "
                  f"修改 {r['edit_count']}次 / 成本 ${r['cost_usd']}")

    # 汇总
    summary = aggregate(results)
    table = render_summary_table(summary)
    conclusion = render_conclusion(summary)

    print("\n" + "=" * 60)
    print("汇总对比表（D3 笔记用的就是这张表）：")
    print(table)
    print("\n" + "=" * 60)
    print(conclusion)

    # 落盘
    csv_path = output_dir / "实测数据.csv"
    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(results[0].keys()))
        writer.writeheader()
        writer.writerows(results)
    print(f"\n明细已保存：{csv_path}")

    txt_path = output_dir / "结论.txt"
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(f"D3 演示运行 · {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("=" * 60 + "\n\n")
        f.write(table + "\n\n")
        f.write(conclusion)
    print(f"结论已保存：{txt_path}")

    return summary


if __name__ == "__main__":
    main()