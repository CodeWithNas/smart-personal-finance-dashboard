import PropTypes from 'prop-types';

const CategorySelect = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  placeholder = '-- Select Category --',
  className = '',
  ...props
}) => (
  <div>
    {label && <label className="block mb-1 font-medium" htmlFor={name}>{label}</label>}
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full border p-2 rounded ${className}`.trim()}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

CategorySelect.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
  required: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default CategorySelect;
