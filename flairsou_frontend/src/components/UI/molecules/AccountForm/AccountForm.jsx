import React from 'react';
import PropTypes from 'prop-types';
import {
  Container,
  Divider,
  Form,
  Header,
} from 'semantic-ui-react';
import { AccountTypesSelect } from '../../../../assets/accountTypeMapping';
import accountShape from '../../../../shapes/accountShape/accountShape';

const AccountForm = ({ account }) => {
  const accountParentOptions = [{
    key: 0, value: 'Aucun', text: 'Aucun',
  }];
  const bookOptions = [{
    key: 0, value: 'Aucun', text: 'Aucun',
  }];
  const associatedEntityOptions = [{
    key: 0, value: 'Aucun', text: 'Aucun',
  }];

  const idIsVirtualCheckbox = 'is-virtual-checkbox';

  return (
    <Container>
      <Header as="h2">Créer un compte</Header>
      <Divider />
      <Form>
        <Form.Input
          label="Nom du compte"
          placeholder="Weekend d'intégration"
          required
          value={account?.name}
        />
        <Form.Select
          options={AccountTypesSelect}
          label="Type du compte"
          required
        />
        <Form.Checkbox
          label="Compte virtuel"
          checked={account?.virtual || false}
        />
        <Form.Select
          options={accountParentOptions}
          label="Compte parent"
        />
        <Form.Select
          options={bookOptions}
          label="Livre associé"
          required
        />
        <Form.Select
          options={associatedEntityOptions}
          label="Entité associée"
        />
        <Form.Button
          content="Créer"
          primary
        />
      </Form>
    </Container>
  );
};

AccountForm.propTypes = {
  account: PropTypes.shape(accountShape),
};

AccountForm.defaultProps = {
  account: null,
};

export default AccountForm;
