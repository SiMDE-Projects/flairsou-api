import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Modal, Button, Header, Icon,
} from 'semantic-ui-react';

/**
 * Dialogue de confirmation de la suppression d'un objet en général
 */
const ConfirmDeleteOperation = ({ objectName, objectDetail, onConfirm }) => {
  const [open, setOpen] = useState(false);

  // genre de l'objet à supprimer, masculin par défaut (genre non marqué)
  let gender = false;

  if (objectName === 'transaction') {
    gender = true;
  }

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
          title={`Supprimer ${gender ? 'la' : 'le'} ${objectName} ${objectDetail ? `<${objectDetail}>` : ''}`}
          onClick={() => setOpen(true)}
        />
      )}
    >
      <Header icon>
        <Icon name="trash alternate" />
        {`Supprimer ${gender ? 'la' : 'le'} ${objectName} ${objectDetail ? `<${objectDetail}>` : ''}`}
      </Header>
      <Modal.Content style={{ textAlign: 'center' }}>
        Voulez-vous vraiment supprimer
        {' '}
        {gender ? 'cette' : 'ce'}
        {' '}
        {objectName}
        {' '}
        ? Cette action est définitive.
      </Modal.Content>
      <Modal.Actions>
        <Button basic color="grey" inverted onClick={() => setOpen(false)} content="Annuler" icon="remove" />
        <Button
          color="red"
          onClick={() => { setOpen(false); onConfirm(); }}
          content={`Supprimer ${gender ? 'la' : 'le'} ${objectName} ${objectDetail ? `<${objectDetail}>` : ''}`}
          icon="trash alternate"
        />
      </Modal.Actions>
    </Modal>
  );
};

ConfirmDeleteOperation.propTypes = {
  // nom de l'objet à supprimer
  objectName: PropTypes.string.isRequired,
  // détails sur l'objet
  objectDetail: PropTypes.string.isRequired,
  // callback de suppression d'une transaction
  onConfirm: PropTypes.func.isRequired,
};

export default memo(ConfirmDeleteOperation);
