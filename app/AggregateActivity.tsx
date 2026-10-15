export type ActivityInsights = {period_days:number;messages:number;joins:number;leaves:number;net_growth:number};

export function AggregateActivity({data,className="panel activity-insights-panel"}:{data:ActivityInsights;className?:string}) {
  return <section className={className}>
    <div className="panel-heading"><div><p className="eyebrow">Last {data.period_days} days</p><h2>Aggregate activity</h2></div><span>Daily community totals</span></div>
    <div className="activity-insight-metrics">
      <div><span>Messages</span><strong>{data.messages.toLocaleString()}</strong></div>
      <div><span>Joins</span><strong>{data.joins.toLocaleString()}</strong></div>
      <div><span>Leaves</span><strong>{data.leaves.toLocaleString()}</strong></div>
      <div><span>Net member growth</span><strong>{data.net_growth>0?"+":""}{data.net_growth.toLocaleString()}</strong></div>
    </div>
    <p className="signal-caption">Statistics do not record individual activity, message text or popular words.</p>
  </section>;
}
