import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const PieChartWidget = ({ data, dataKey = 'value', nameKey = 'name', colors = [], outerRadius = 80, height = 250 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        cx="50%"
        cy="50%"
        outerRadius={outerRadius}
        label
      >
        {data.map((_, index) => (
          <Cell key={index} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

export default PieChartWidget;
