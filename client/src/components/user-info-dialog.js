import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import Button from 'material-ui/Button';
import Dialog, {
  withResponsiveFullScreen,
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

let ResponsiveDialog = withResponsiveFullScreen()(Dialog);

class UserInfoDialog extends React.Component {
  render() {
    const {user, t, ...rest} = this.props;
    return (
      <ResponsiveDialog {...rest}>
        <DialogTitle>{t('user_info_dialog.title')}</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('user_info_dialog.username')}</TableCell>
                <TableCell>{t('user_info_dialog.teamname')}</TableCell>
                <TableCell>{t('user_info_dialog.affiliation')}</TableCell>
                <TableCell>{t('user_info_dialog.country')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow key={0}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.teamname}</TableCell>
                <TableCell>{(user.affiliation && user.affiliation.name) || t('user_info_dialog.n/a')}</TableCell>
                <TableCell>{(user.affiliation && user.affiliation.country) || t('user_info_dialog.n/a')}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={rest.onRequestClose} color="primary">
            {t('user_info_dialog.close')}
          </Button>
        </DialogActions>
      </ResponsiveDialog>
    );
  }
}

UserInfoDialog.propTypes = {
  user: PropTypes.object.isRequired, // dict
  onRequestClose: PropTypes.func.isRequired,
};

export default translate('translations')(UserInfoDialog);
