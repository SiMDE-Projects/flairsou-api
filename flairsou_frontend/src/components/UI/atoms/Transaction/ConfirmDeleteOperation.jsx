import React, { useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, Button, Header, Icon,
} from 'semantic-ui-react';

/**
 * Dialogue de confirmation de la suppression d'une transaction
 */
const ConfirmDeleteOperation = ({ onConfirm }) => {
  const [open, setOpen] = useState(false);

  return (
    <Modal
      basic
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      size="small"
      trigger={(
        <Icon
          name="trash alternate"
          color="red"
          link
          title="Supprimer la transaction"
          onClick={() => setOpen(true)}
        />
      )}
    >
      <Header icon>
        <Icon name="trash alternate" />
        Supprimer la transaction
      </Header>
      <Modal.Content style={{ textAlign: 'center' }}>
        Voulez-vous vraiment supprimer cette transaction ? Cette action est définitive.
      </Modal.Content>
      <Modal.Actions>
        <Button basic color="grey" inverted onClick={() => setOpen(false)} content="Annuler" icon="remove" />
        <Button color="red" onClick={onConfirm} content="Supprimer la transaction" icon="trash alternate" />
      </Modal.Actions>
    </Modal>
  );
};

ConfirmDeleteOperation.propTypes = {
  // callback de suppression d'une transaction
  onConfirm: PropTypes.func.isRequired,
};

export default ConfirmDeleteOperation;
