import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';

class UserInfoDialog extends React.Component {
  render() {
    const {user, ...rest} = this.props;
    return (
      <Dialog {...rest}>
        <DialogTitle>User information</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Teamname</TableCell>
                <TableCell>Affiliation</TableCell>
                <TableCell>Country</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow key={0}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.teamname}</TableCell>
                <TableCell>{(user.affiliation && user.affiliation.name) || 'N/A'}</TableCell>
                <TableCell>{(user.affiliation && user.affiliation.country) || 'N/A'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={rest.onRequestClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

UserInfoDialog.propTypes = {
  user: PropTypes.object.isRequired // dict
};

export default UserInfoDialog;
