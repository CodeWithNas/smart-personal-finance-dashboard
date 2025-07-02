import PropTypes from 'prop-types';

const DateInput = ({
  label,
  name,
  value,
  onChange,
  type = 'date',
  required = false,
  className = '',
  ...props
}) => (
  <div>
    {label && <label className="block mb-1 font-medium" htmlFor={name}>{label}</label>}
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full border p-2 rounded ${className}`.trim()}
      {...props}
    />
  </div>
);

DateInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default DateInput;
