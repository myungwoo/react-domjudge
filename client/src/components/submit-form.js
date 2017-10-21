import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Input, {InputLabel} from 'material-ui/Input';
import {MenuItem} from 'material-ui/Menu';
import {FormControl} from 'material-ui/Form';
import Select from 'material-ui/Select';

import Auth from '../storages/auth';
import Config from '../storages/config';

import Loading from './loading';

class SubmitForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filenames: [],
      language: '',
      problem: '',

      problems: [],
      languages: [],
    };
  }
  
  componentDidMount() {
    this.loadForm();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (JSON.stringify(this.props.contest) !== JSON.stringify(nextProps.contest)){
      // If contest has been changed problem, language list also has to be changed
      this.loadForm(nextProps.contest);
    }
    return JSON.stringify(this.props) !== JSON.stringify(nextProps) ||
           JSON.stringify(this.state) !== JSON.stringify(nextState);
  }
  
  loadForm(c) {
    const {setLoading, toast} = this.props;
    const contest = c || this.props.contest;
    (async function(){
      setLoading(true);
      let problems = (await axios.post('/api/problems', {cid: contest.cid}, Auth.getHeader())).data;
      let languages = (await axios.get('/api/languages', Auth.getHeader())).data;
      this.setState({problems, languages, problem: '', language: ''});
      setLoading(false);
    }).bind(this)()
      .catch(() => toast('Something went wrong, please reload the app.'));
  }

  selectFiles(evt) {
    const maxfiles = Config.getConfig('sourcefiles_limit', 100);
    const maxsize = Config.getConfig('sourcesize_limit', 256);
    const {toast} = this.props;
    let files = Array.from(evt.target.files);
    evt.target.value = '';
    if (files.length > maxfiles){
      toast('You select too many files (At most '+maxfiles+' files)');
      return;
    }
    let totalsize = files.map(e => e.size).reduce((a, b) => a+b, 0);
    if (totalsize > maxsize*1024){
      toast('File(s) are too big.');
      return;
    }

    let filenames = files.map(e => e.name);
    if (filenames.length > 0){
      // Detecting problem, language from filename
      let filename = filenames[0];
      let arr = filename.split('.');
      let name = arr[0].toLowerCase(), ext = arr.slice(1).join('.').toLowerCase();
      for (let lang of this.state.languages){
        if (lang.extensions.map(e => e.toLowerCase()).includes(ext)){
          this.setState({language: lang.langid});
          break;
        }
      }
      for (let prob of this.state.problems){
        if (prob.shortname.toLowerCase() === name){
          this.setState({problem: prob.probid});
          break;
        }
      }
    }
    this.files = files;
    this.setState({filenames});
  }

  validateForm() {
    return this.state.filenames.length > 0 &&
           this.state.problems.map(p => p.probid).includes(this.state.problem) &&
           this.state.languages.map(l => l.langid).includes(this.state.language);
  }

  doSubmit() {
    const {toast, afterSubmit, contest} = this.props;
    const {problem, language} = this.state;
    const files = this.files;
    let data = new FormData();
    for (let file of files)
      data.append('files', file);
    data.append('cid', contest.cid);
    data.append('probid', problem);
    data.append('langid', language);
    this.setState({loading: true});
    axios.post('/api/submit', data, Auth.getHeader())
      .then(res => {
        this.setState({loading: false});
        if (res.data.success){
          toast('Submission succeed!'); // TODO: message
          afterSubmit();
        }
        else toast('Submission failed!'); // TODO: message
      })
      .catch(() => {
        this.setState({loading: false});
        toast('Something went wrong, please reload the app.');
      });
  }

  render() {
    const styles = {
      fullwidth: {
        width: '100%',
      },
    };
    const maxfiles = Config.getConfig('sourcefiles_limit', 100);

    return (
      <Grid container spacing={16}>
        {this.state.loading && <Loading />}
        {this.state.filenames.length > 0 &&
        <Grid item xs={12} style={{textAlign: 'center'}}>
          Selected file(s): {this.state.filenames.join(', ')}
        </Grid>}
        <Grid item xs={12} sm={3}>
          <input id="file" multiple={maxfiles > 1} type="file" style={{display: 'none'}} onChange={this.selectFiles.bind(this)}/>
          <label htmlFor="file">
            <Button raised component="span" style={{...styles.fullwidth}}>
              Select file
            </Button>
          </label>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl style={styles.fullwidth}>
            <InputLabel htmlFor="problem">Problem</InputLabel>
            <Select
              value={this.state.problem}
              onChange={evt => this.setState({problem: evt.target.value})}
              input={<Input id="problem" />}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {this.state.problems.map((e, idx) => (
                <MenuItem value={e.probid} key={idx}>{e.shortname}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <FormControl style={styles.fullwidth}>
            <InputLabel htmlFor="language">Language</InputLabel>
            <Select
              value={this.state.language}
              onChange={evt => this.setState({language: evt.target.value})}
              input={<Input id="language" />}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {this.state.languages.map((e, idx) => (
                <MenuItem value={e.langid} key={idx}>{e.langid}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            raised color="primary"
            disabled={!this.validateForm()}
            style={{...styles.fullwidth}}
            onClick={this.doSubmit.bind(this)}>Submit</Button>
        </Grid>
      </Grid>
    );
  }
}

SubmitForm.propTypes = {
  toast: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  contest: PropTypes.object.isRequired,
  afterSubmit: PropTypes.func.isRequired,
};

export default SubmitForm;
