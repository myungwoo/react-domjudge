import React from 'react';
import {translate} from 'react-i18next';
import {withStyles} from 'material-ui/styles';

import Button from 'material-ui/Button';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Dialog, { DialogTitle, DialogActions } from 'material-ui/Dialog';

import CheckIcon from 'material-ui-icons/Check';

import Language from '../storages/language';

import {availableLanguages} from '../config';

const styles = () => ({
  flag: {paddingRight: 10},
});

class LanguageSelectDialog extends React.Component {
  handleClick = lng => () => {
    const {i18n, onRequestClose} = this.props;
    onRequestClose();
    Language.setLanguage(lng);
    i18n.changeLanguage(lng);
  };

  render() {
    const {t, classes, ...rest} = this.props;
    const languages = availableLanguages;
    const lng = Language.getLanguage();
    return (
      <Dialog {...rest}>
        <DialogTitle>{t('language_select_dialog.title')}</DialogTitle>
        <List>
          {languages.map((e, idx) => (
            <ListItem button key={idx} onClick={this.handleClick(e.code)}>
              <img src={`./flags/${e.cc}.png`} alt={e.name} className={classes.flag} />
              <ListItemText inset primary={e.name} />
              {lng === e.code &&
                <ListItemIcon>
                  <CheckIcon />
                </ListItemIcon>}
            </ListItem>
          ))}
        </List>
        <DialogActions>
          <Button onClick={this.props.onRequestClose} color="primary">
            {t('language_select_dialog.close')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

LanguageSelectDialog.propTypes = {
};

export default withStyles(styles)(translate('translations')(LanguageSelectDialog));