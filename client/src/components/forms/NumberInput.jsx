import PropTypes from 'prop-types';

const NumberInput = ({ label, name, value, onChange, placeholder = '', required = false, className = '', ...props }) => (
  <div>
    {label && <label className="block mb-1 font-medium" htmlFor={name}>{label}</label>}
    <input
      type="number"
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`w-full border p-2 rounded ${className}`.trim()}
      {...props}
    />
  </div>
);

NumberInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default NumberInput;
