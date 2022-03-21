import React, { memo } from 'react';
import {
  Container, Header, Table, Icon, Divider, Message,
} from 'semantic-ui-react';

const HomeContent = () => (
  <Container text>
    <Header as="h1">Flairsou est en ligne !</Header>
    <p>
      Flairsou est désormais en ligne. Les trésorier, trésorier-adjoint, président et
      vice-président déclarés sur le portail des assos peuvent maintenant l&apos;utiliser
      pour suivre la comptabilité de leur association.
    </p>
    <p>
      Nous vous recommandons de saisir votre comptabilité à partir du
      {' '}
      <b>1er janvier 2022</b>
      {' '}
      pour vous caler correctement sur l&apos;année civile.
    </p>

    <Message positive>
      <Message.Header>Aide à la mise en route</Message.Header>
      <p>
        Si vous avez des difficultés à mettre en route le suivi de votre comptabilité, il est
        possible d&apos;organiser des
        {' '}
        <b>séances de formation et d&apos;aide à la prise en main</b>
        . N&apos;hésitez
        pas à nous signaler si vous êtes intéressés par mail à
        {' '}
        <a href="mailto:flairsou@assos.utc.fr">flairsou@assos.utc.fr</a>
        .
      </p>
    </Message>

    <p>Vous trouverez sur cette page quelques informations pour bien démarrer sur Flairsou</p>

    <ul>
      <li><a href="#infos-generales">Informations générales</a></li>
      <li><a href="#infos-clubs">Informations pour les clubs</a></li>
      <li><a href="#infos-poles">Informations pour les pôles</a></li>
      <li><a href="#retours-exp">Retours d&apos;expérience</a></li>
    </ul>

    <Divider />

    <Header as="h2" id="infos-generales">Informations générales</Header>

    <Header as="h3">Démarrage</Header>
    <p>
      Le bandeau de gauche vous indique les associations pour lesquelles vous pouvez consulter les
      comptes. En cliquant sur une association, vous affichez la liste des comptes créés pour cette
      association.
    </p>

    <Header as="h3">Comptes</Header>
    <p>
      Flairsou utilise le principe de comptabilité en partie double : chaque action financière
      correspond à une transaction entre au moins deux comptes. Le compte bancaire ou la caisse
      de l&apos;association sont représentés par des comptes d&apos;&quot;actifs&quot;. Les postes
      de dépenses et de recettes sont également représentés par des comptes correspondants.
      Pour enregistrer un achat de matériel par exemple payé par virement, une transaction est créée
      entre le compte d&apos;actifs &quot;Compte courant&quot; et le compte de dépenses
      &quot;Matériel&quot;, qui indique de quel montant chaque compte doit être modifié.
    </p>

    <Header as="h3">Structure des comptes</Header>
    <p>
      La structure des comptes de dépenses et de recettes doit correspondre à l&apos;activité de
      votre association. Vous avez la possibilité de créer des nouveaux comptes en fonction de vos
      besoins. Les comptes peuvent être réels ou virtuels. Un compte virtuel ne peut pas enregistrer
      de transactions, il sert simplement à créer une catégorie et à regrouper des sous-comptes. Un
      compte réel peut enregistrer des transactions mais ne peut pas avoir de sous-comptes. Par
      exemple, dans la hiérarchie suivante :
    </p>

    <Table basic compact>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <div className="nav-account-level-0">
              <Icon name="university" />
              Dépenses (virtuel)
            </div>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <div className="nav-account-level-1">
              <Icon name="university" />
              Matériel
            </div>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <div className="nav-account-level-1">
              <Icon name="university" />
              Communication (virtuel)
            </div>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <div className="nav-account-level-2">
              <Icon name="university" />
              Affiches
            </div>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <div className="nav-account-level-2">
              <Icon name="university" />
              Communcation Internet
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>

    <p>
      Les comptes &quot;Dépenses&quot; et &quot;Communication&quot; contiennent des
      sous-comptes, il s&apos;agit donc de comptes virtuels qui correspondent à des
      catégories de dépenses abstraites. &quot;Matériel&quot;, &quot;Affiches&quot;
      et &quot;Communication Internet&quot; sont des comptes qui correspondent à des
      postes de dépenses concrets.
    </p>
    <p>
      Une structure de base vous est proposée, mais vous êtes totalement libres de
      l&apos;organisation des comptes de votre asso.
    </p>

    <Header as="h3">Solde initial d&apos;un compte</Header>
    <p>
      Nous vous conseillons de commencer la saisie de vos comptes à partir du 1er janvier
      2022. Pour la plupart d&apos;entre vous, les comptes bancaires de vos associations sont
      déjà ouverts, il est donc nécessaire de définir un solde initial correspondant au solde
      de votre compte à cette date.
    </p>
    <p>
      Le solde initial se définit en créant une transaction avec le compte de
      &quot;Capitaux Propres&quot;. Ce compte correspond à l&apos;argent appartenant
      à votre association au début de chaque période. Par exemple, pour saisir un solde
      initial sur le compte courant correspondant à votre compte en banque, il faut créer
      une transaction avec le compte &quot;Capitaux Propres&quot;, qui apporte une recette
      au compte courant. (Si vous regardez dans le détail, le compte courant aura un solde
      positif, et le compte &quot;Capitaux propres&quot; aussi : c&apos;est normal même
      si ça semble peu intuitif au départ. Il y a un mécanisme de débit et de crédit sur
      les opérations qui fait varier différemment le solde en fonction du type de compte,
      ce qui permet d&apos;avoir généralement des montants positifs plus faciles à interpréter.)
    </p>
    <p>
      Si votre association dispose de monnaie en caisse au 1er janvier 2022, vous pouvez (devez)
      également définir le solde initial du compte &quot;Monnaie&quot; de cette même façon.
    </p>

    <Header as="h3">Édition des transactions</Header>
    <p>
      Dans la vue d&apos;édition des transactions, vous pouvez saisir la date, une description
      de la transaction, le compte associé (les transactions sont toujours avec 2 comptes pour le
      moment), et le montant associé à la dépense ou à la recette. Ici, &quot;Dépense&quot; et
      &quot;Recette&quot; sont à interpréter du point de vue du compte sur lequel vous vous trouvez.
      Si vous saisissez une dépense depuis le compte de dépenses &quot;Matériel&quot;, alors
      c&apos;est une recette pour ce compte car on va augmenter son solde. Si ça ne vous paraît pas
      clair, dans le doute, saisissez toujours les transactions depuis le compte en banque ou le
      compte de caisse, pour avoir un terme de dépense / recette cohérent.
    </p>
    <p>
      Quand une transaction est modifiée localement mais pas enregistrée, le cadenas vert à gauche
      devient une disquette orange. Pour enregistrer la transaction, il faut taper la touche
      &apos;Entrée&apos; dans un champ de texte de cette transaction (description, compte ou
      montant). Le cadenas vert remplace alors la disquette.
    </p>

    <Divider />
    <Header as="h2" id="infos-clubs">Informations pour les clubs</Header>

    <Message warning>
      <Message.Header>Ne créez pas de comptes pour vos clubs !</Message.Header>
    </Message>
    <p>
      En tant que président ou trésorier de club, vous n&apos;avez initialement pas de comptes
      créés. C&apos;est normal car un club n&apos;a pas de compte bancaire séparé de celui du pôle.
      {' '}
      <b>Ne créez pas de comptes pour vos clubs :</b>
      {' '}
      vos comptes sont gérés par votre pôle.
      Des fonctionnalités spécifiques sont prévues en priorité pour la prochaine version, pour
      vous permettre de voir les comptes de votre pôle qui vous concernent.
    </p>

    <Divider />
    <Header as="h2" id="infos-poles">Informations pour les pôles</Header>
    <p>
      Chaque pôle est responsable du suivi de sa trésorerie propre, ainsi que de celle de ses
      commissions, clubs et projets. Par conséquent, le trésorier du pôle a accès aux comptes de ses
      commissions et projets sur Flairsou, car ces entités disposent de comptes séparés. Ceci permet
      de vérifier que les associations assurent correctement le suivi de leur comptabilité, et de
      pouvoir récupérer les informations en cas de contrôle.
      Concernant les clubs, ces associations n&apos;ont pas de compte séparé, c&apos;est le pôle qui
      gère ces éléments dans le &quot;pot commun&quot; du compte courant. Flairsou permet aux pôles
      de définir, pour chaque compte, une entité (en l&apos;occurence un club) associée à ce compte.
      Ce système permet de donner au trésorier du club un accès en lecture aux comptes du pôle les
      concernant.
    </p>
    <p>
      Nous vous conseillons d&apos;adopter la structure suivante pour les comptes d&apos;actifs :
    </p>

    <Table basic compact>
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <div className="nav-account-level-0">
              <Icon name="university" />
              Actifs (virtuel)
            </div>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <div className="nav-account-level-1">
              <Icon name="university" />
              Actifs actuels (virtuel)
            </div>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <div className="nav-account-level-2">
              <Icon name="university" />
              Compte courant (virtuel)
              {' '}
              <em>[compte qui correspond au compte bancaire du pôle]</em>
            </div>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <div className="nav-account-level-3">
              <Icon name="university" />
              Compte Pôle
              {' '}
              <em>[compte dédié aux opérations spécifiques du pôle]</em>
            </div>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <div className="nav-account-level-3">
              <Icon name="university" />
              Compte Club 1
              {' '}
              <em>
                [compte dédié aux opérations du Club 1, associé avec l&apos;entité
                Club 1]
              </em>
            </div>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <div className="nav-account-level-3">
              <Icon name="university" />
              Compte Club 2
              {' '}
              <em>
                [compte dédié aux opérations du Club 2, associé avec l&apos;entité
                Club 2]
              </em>
            </div>
          </Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <div className="nav-account-level-3">
              <Icon name="university" />
              ...
            </div>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>

    <p>
      Avec ce système, vous pouvez suivre facilement le &quot;solde&quot; dédié à chaque club,
      et grâce à l&apos;entité associée, le club pourra également visualiser son &quot;solde&quot;.
      La même structure peut être utilisée pour séparer les comptes de dépenses et
      de recettes entre les comptes concernant le pôle et les comptes concernant les clubs.
    </p>

    <Divider />

    <Header as="h2" id="retours-exp">Retours d&apos;expérience</Header>

    <Header as="h3">Bugs</Header>

    <p>
      Flairsou est une application toute neuve qui doit encore être améliorée. Certains
      dysfonctionnements sont à anticiper car nous n&apos;avons pas pu penser à toutes les
      situations, nous vous remercions pour votre indulgence.
    </p>
    <p>
      Si vous rencontrez un bug, vous pouvez nous en informer par deux moyens :
      <ul>
        <li>
          par mail à l&apos;adresse
          {' '}
          <a href="mailto:flairsou@assos.utc.fr">flairsou@assos.utc.fr</a>
        </li>
        <li>
          sur le dépôt Github du projet
          (
          <a href="https://github.com/SiMDE-Projects/flairsou-api/issues">
            https://github.com/SiMDE-Projects/flairsou-api/issues
          </a>
          )
        </li>
      </ul>
      Dans tous les cas, si vous notez un bug dans l&apos;application, essayez de nous fournir
      le plus d&apos;informations possibles sur l&apos;erreur : association concernée, opération en
      cours de réalisation...
      N&apos;hésitez pas non plus à nous joindre des captures d&apos;écran pour nous donner un
      visuel de l&apos;erreur.
    </p>

    <Header as="h3">Cas d&apos;usage spécifique</Header>
    <p>
      Flairsou a été conçu pour une tenue classique de comptabilité adaptée à la structure de la
      fédération associative. Il est possible que votre association présente une particularité à
      laquelle nous n&apos;avons pas pensé, et qui n&apos;est pas réalisable avec Flairsou. Dans
      ce cas, n&apos;hésitez pas à nous en faire part en nous expliquant votre fonctionnement et
      comment Flairsou pourrait évoluer pour le prendre en compte. Nous verrons alors s&apos;il
      est possible et souhaitable de modifier Flairsou pour intégrer ce cas.
    </p>

    <Header as="h3">Suggestions</Header>
    <p>
      Nous sommes égalements à l&apos;écoute de vos suggestions pour améliorer l&apos;outil, car
      il s&apos;adresse uniquement à vous, et l&apos;objectif est que vous puissiez l&apos;utiliser
      le plus facilement possible.
    </p>
  </Container>
);

export default memo(HomeContent);
