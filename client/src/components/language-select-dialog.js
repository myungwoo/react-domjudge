import React from 'react';
import {translate} from 'react-i18next';

import Button from 'material-ui/Button';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Dialog, { DialogTitle, DialogActions } from 'material-ui/Dialog';

import CheckIcon from 'material-ui-icons/Check';

import Language from '../storages/language';

class LanguageSelectDialog extends React.Component {
  handleClick(lng) {
    const {i18n, onRequestClose} = this.props;
    onRequestClose();
    Language.setLanguage(lng);
    i18n.changeLanguage(lng);
  }

  render() {
    let {t, ...rest} = this.props;
    const languages = [{code: 'en', name: 'English', cc: 'GBR'}, {code: 'ko', name: '한국어', cc: 'KOR'}];
    const lng = Language.getLanguage();
    return (
      <Dialog {...rest}>
        <DialogTitle>{t('language_select_dialog.title')}</DialogTitle>
        <div>
          <List>
            {languages.map((e, idx) => (
              <ListItem button key={idx} onClick={this.handleClick.bind(this, e.code)}>
                <img src={`./flags/${e.cc}.png`} alt={e.name} style={{paddingRight: 10}} />
                <ListItemText inset primary={e.name} />
                {lng === e.code &&
                  <ListItemIcon>
                    <CheckIcon />
                  </ListItemIcon>}
              </ListItem>
            ))}
          </List>
        </div>
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

export default translate('translations')(LanguageSelectDialog);