import PropTypes from 'prop-types';

const accountNodeShape = {
  pk: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  fullName: PropTypes.string.isRequired,
  account_type: PropTypes.number.isRequired,
  virtual: PropTypes.bool.isRequired,
  balance: PropTypes.number.isRequired,
  associated_entity: PropTypes.string,
};
accountNodeShape.account_set = PropTypes.arrayOf(PropTypes.shape(accountNodeShape)).isRequired;

export default accountNodeShape;
