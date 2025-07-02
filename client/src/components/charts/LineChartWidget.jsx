import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';

const LineChartWidget = ({ data, xKey = 'date', lineKey = 'value', color = '#8884d8', height = 250 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey={lineKey} stroke={color} strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);

export default LineChartWidget;
