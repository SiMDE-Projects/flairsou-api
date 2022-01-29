import React from 'react';
import {
  Button,
  Checkbox,
  Container, Divider,
  Form, Header,
  Input,
  Select,
} from 'semantic-ui-react';
import { ACCOUNT_TYPE } from '../../../../reducers/constants';

const CreateAccount = () => {
  const accountTypeOptions = ACCOUNT_TYPE.map((e) => ({
    ...e,
    text: e.value,
  }));
  const accountParentOptions = [{
    key: 0, value: 'Aucun', text: 'Aucun',
  }];

  const idIsVirtualCheckbox = 'is-virtual-checkbox';

  return (
    <Container>
      <Header as="h2">Créer un compte</Header>
      <Divider />
      <Form>
        <Form.Group>
          <Form.Field
            id="form-input-control-first-name"
            control={Input}
            label="Nom du compte"
            placeholder="Weekend d'intégration"
            required
          />
          <Form.Field
            control={Select}
            options={accountTypeOptions}
            label="Type du compte"
            required
          />
          <Form.Field>
            <label htmlFor={idIsVirtualCheckbox}>Virtuel</label>
            <Checkbox id={idIsVirtualCheckbox} />
          </Form.Field>
          <Form.Field
            control={Select}
            options={accountParentOptions}
            label="Compte parent"
          />
          <Form.Field
            control={Button}
            content="Créer"
            primary
          />
        </Form.Group>
      </Form>
    </Container>
  );
};

export default CreateAccount;
