import React from 'react';
import PropTypes from 'prop-types';
import {translate} from 'react-i18next';
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

let ResponsiveDialog = withResponsiveFullScreen()(Dialog);

class ClarificationDialog extends React.Component {
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
      .then(res => {
        this.setState({loading: false, problems: res.data});
      })
      .catch(() => {
        this.setState({loading: false});
        toast(t('error'));
      });
  }

  sendClarification() {
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
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const {clarification, contest, user, toast, afterSend, t, ...rest} = this.props;
    const formatTime = t => {
      let s = Math.max(Math.floor((t-contest.starttime)/60), 0);
      const pad2 = v => v < 10 ? '0'+v : ''+v;
      return pad2(Math.floor(s/60)) + ':' + pad2(s%60);
    };
    const styles = {
      code: {
        borderTop: '1px dotted #c0c0c0',
        borderBottom: '1px dotted #c0c0c0',
        backgroundColor: '#fafafa',
        padding: 5,
        fontFamily: 'monospace',
        overflowX: 'scroll',
        whiteSpace: 'pre-wrap',
      },
    };
    return (
      <ResponsiveDialog {...rest}>
        {this.state.loading && <Loading />}
        <DialogTitle>{clarification.original && clarification.original.sender !== user.teamid ? t('clarification.title') : t('clarification.request_title')}</DialogTitle>
        <DialogContent>
          {clarification.list && clarification.list.map((e, idx) => (
            <table style={{paddingBottom: 20, width: '100%'}} key={idx}>
              <tbody>
                <tr><td style={{width: 80}}>{t('clarification.from')}:</td><td>{e.from}</td></tr>
                <tr><td>{t('clarification.to')}:</td><td>{e.to}</td></tr>
                <tr><td>{t('clarification.subject')}:</td><td>{e.subject}</td></tr>
                <tr><td>{t('clarification.time')}:</td><td>{formatTime(e.submittime)}</td></tr>
                <tr><td></td><td><pre style={styles.code}>{e.body}</pre></td></tr>
              </tbody>
            </table>
          ))}
          <Typography type="title" style={{paddingBottom: 15}}>{t('clarification.send_title')}</Typography>
          <TextField
            style={{paddingBottom: 8}}
            label={t('clarification.to')}
            value="Jury"
            fullWidth
            disabled/>
          <FormControl style={{paddingBottom: 8, width: '100%'}}>
            <InputLabel htmlFor="problem">{t('clarification.subject')}</InputLabel>
            <Select
              value={this.state.subject}
              onChange={evt => this.setState({subject: evt.target.value})}
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
            label={t('clarification.text')}
            multiline
            value={this.state.text}
            onChange={evt => this.setState({text: evt.target.value})}
            fullWidth/>
        </DialogContent>
        <DialogActions>
          <Button onClick={rest.onRequestClose} color="primary">
            {t('clarification.close')}
          </Button>
          <Button onClick={() => this.setState({open: true})} color="primary" disabled={this.state.text === ''}>
            {t('clarification.send')}
          </Button>
        </DialogActions>
        <Dialog open={this.state.open} onRequestClose={() => this.setState({open: false})}>
          <DialogTitle>{t('clarification.confirm_title')}</DialogTitle>
          <DialogActions>
            <Button onClick={() => this.setState({open: false})} color="primary">
              {t('clarification.no')}
            </Button>
            <Button onClick={this.sendClarification.bind(this)} color="primary">
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

export default translate('translations')(ClarificationDialog);
