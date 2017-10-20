import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import List, { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import Dialog, { DialogTitle, DialogActions } from 'material-ui/Dialog';

import CheckIcon from 'material-ui-icons/Check';

import Contest from './../storages/contest';

class ContestSelectDialog extends React.Component {
  handleClick(contest) {
    this.props.onRequestClose();
    if (Contest.setContest(contest))
      this.props.onContestChange(contest);
  }

  render() {
    // Since contest list will not be changed after app load.
    // So it's able to use localStorage instead of state/props.
    let contests = Contest.getList();
    let {contest, onContestChange, ...rest} = this.props; // eslint-disable-line no-unused-vars
    return (
      <Dialog {...rest}>
        <DialogTitle>Select other contest</DialogTitle>
        <div>
          <List>
            {contests.map(c => (
              <ListItem button key={c.cid} onClick={this.handleClick.bind(this, c)}>
                {contest.cid === c.cid &&
                  <ListItemIcon>
                    <CheckIcon />
                  </ListItemIcon>}
                <ListItemText inset primary={c.name} />
              </ListItem>
            ))}
          </List>
        </div>
        <DialogActions>
          <Button onClick={this.props.onRequestClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

ContestSelectDialog.propTypes = {
  onRequestClose: PropTypes.func,
  onContestChange: PropTypes.func.isRequired,
  contest: PropTypes.object.isRequired,
};

export default ContestSelectDialog;