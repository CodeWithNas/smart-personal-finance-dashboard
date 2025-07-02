import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

const BarChartWidget = ({ data, xKey = 'name', bars = [], height = 250 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      {bars.map(({ dataKey, fill }, idx) => (
        <Bar key={dataKey || idx} dataKey={dataKey} fill={fill} />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

export default BarChartWidget;
