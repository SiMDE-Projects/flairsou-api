import PropTypes from 'prop-types';

const accountShape = {
  pk: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  account_type: PropTypes.number.isRequired,
  virtual: PropTypes.bool.isRequired,
  parent: PropTypes.number,
  book: PropTypes.number.isRequired,
  associated_entity: PropTypes.string,
  balance: PropTypes.number.isRequired,
};

export default accountShape;
