import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
import {withStyles} from 'material-ui/styles';

import axios from 'axios';

import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Button from 'material-ui/Button';
import Input, {InputLabel} from 'material-ui/Input';
import {MenuItem} from 'material-ui/Menu';
import {FormControl} from 'material-ui/Form';
import Select from 'material-ui/Select';
import Dialog, {
  withResponsiveFullScreen,
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';

import Loading from './loading';

import Auth from '../storages/auth';
import Config from '../storages/config';

import {formatTime} from '../Helper';

const styles = () => ({
  table: {paddingBottom: 20, width: '100%'},
  code: {
    borderTop: '1px dotted #c0c0c0',
    borderBottom: '1px dotted #c0c0c0',
    backgroundColor: '#fafafa',
    padding: 5,
    fontFamily: 'monospace',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
  },
  title: {paddingBottom: 15},
  from: {width: 80},
  formElement: {paddingBottom: 8},
});

let ResponsiveDialog = withResponsiveFullScreen()(Dialog);

class ClarificationDialog extends React.PureComponent {
  constructor(props) {
    super(props);
    const {clarification} = this.props;
    this.categories = Config.getConfig('clar_categories', {'general':'General issue', 'tech':'Technical issue'});
    const first = Object.entries(this.categories)[0];
    let subject = 'general';
    if (clarification.original && clarification.original.category) subject = clarification.original.category;
    else if (clarification.original && clarification.original.probid) subject = clarification.original.probid;
    else if (first && first[0]) subject = first[0];
    let text = '';
    if (clarification.original && clarification.original.body){
      let body = clarification.original.body;
      text = body.split('\n').map(e => '> '+e).join('\n').trim()+'\n';
    }
    this.state = {
      clarifications: [],
      problems: [],
      subject,
      text: text,
      loading: true,
    };
    this.notified = new Set();
  }

  componentDidMount() {
    const {contest, toast, t} = this.props;
    // Get problem list
    axios.get(`./api/problems?cid=${contest.cid}`, Auth.getHeader())
      .then(res => this.setState({loading: false, problems: res.data}))
      .catch(() => {
        this.setState({loading: false});
        toast(t('error'));
      });
  }

  sendClarification = () => {
    const {contest, toast, afterSend, onRequestClose, t} = this.props;
    const {subject, text} = this.state;
    this.setState({loading: true, open: false});
    axios.post('./api/clarification', {
      cid: contest.cid,
      subject,
      text,
    }, Auth.getHeader())
      .then(() => {
        toast(t('clarification.request_sent'));
        this.setState({loading: false});
        onRequestClose();
        afterSend();
      })
      .catch(() => {
        this.setState({loading: false});
        toast(t('error'));
      });
  };

  handleChange = evt => this.setState({[evt.target.name]: evt.target.value});
  handleTargetChange = name => evt => this.setState({[name]: evt.target.value});
  handleOpen = val => () => this.setState({open: val});

  render() {
    // eslint-disable-next-line no-unused-vars
    const {clarification, contest, user, toast, afterSend, t, classes, ...rest} = this.props;
    return (
      <ResponsiveDialog {...rest}>
        {this.state.loading && <Loading />}
        <DialogTitle>{clarification.original && clarification.original.sender !== user.teamid ? t('clarification.title') : t('clarification.request_title')}</DialogTitle>
        <DialogContent>
          {clarification.list && clarification.list.map((e, idx) => (
            <table className={classes.table} key={idx}>
              <tbody>
                <tr><td className={classes.from}>{t('clarification.from')}:</td><td>{e.from}</td></tr>
                <tr><td>{t('clarification.to')}:</td><td>{e.to}</td></tr>
                <tr><td>{t('clarification.subject')}:</td><td>{e.subject}</td></tr>
                <tr><td>{t('clarification.time')}:</td><td>{formatTime(contest.starttime, e.submittime)}</td></tr>
                <tr><td></td><td><pre className={classes.code}>{e.body}</pre></td></tr>
              </tbody>
            </table>
          ))}
          <Typography type="title" className={classes.title}>{t('clarification.send_title')}</Typography>
          <TextField
            className={classes.formElement}
            label={t('clarification.to')}
            value="Jury"
            fullWidth
            disabled />
          <FormControl fullWidth className={classes.formElement}>
            <InputLabel htmlFor="problem">{t('clarification.subject')}</InputLabel>
            <Select
              value={this.state.subject}
              onChange={this.handleTargetChange('subject')}
              input={<Input id="problem" />}
            >
              {Object.entries(this.categories).map((e, idx) => (
                <MenuItem value={e[0]} key={idx}>{e[1]}</MenuItem>
              ))}
              {this.state.problems.map((e, idx) => (
                <MenuItem value={e.probid} key={idx}>Problem {e.shortname}: {e.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            name="text"
            label={t('clarification.text')}
            multiline
            value={this.state.text}
            onChange={this.handleChange}
            fullWidth/>
        </DialogContent>
        <DialogActions>
          <Button onClick={rest.onRequestClose} color="primary">
            {t('clarification.close')}
          </Button>
          <Button onClick={this.handleOpen(true)} color="primary" disabled={this.state.text === ''}>
            {t('clarification.send')}
          </Button>
        </DialogActions>
        <Dialog open={this.state.open} onRequestClose={this.handleOpen(false)}>
          <DialogTitle>{t('clarification.confirm_title')}</DialogTitle>
          <DialogActions>
            <Button onClick={this.handleOpen(false)} color="primary">
              {t('clarification.no')}
            </Button>
            <Button onClick={this.sendClarification} color="primary">
              {t('clarification.yes')}
            </Button>
          </DialogActions>
        </Dialog>
      </ResponsiveDialog>
    );
  }
}

ClarificationDialog.propTypes = {
  clarification: PropTypes.object.isRequired, // dict
  contest: PropTypes.object.isRequired, // dict
  user: PropTypes.object.isRequired, // dict
  afterSend: PropTypes.func.isRequired,
  onRequestClose: PropTypes.func.isRequired,
  toast: PropTypes.func.isRequired,
};

export default withStyles(styles)(translate('translations')(ClarificationDialog));
