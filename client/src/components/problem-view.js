import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import Button from 'material-ui/Button';

import Loading from './loading';

import Auth from '../storages/auth';

class ProblemView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
    };
  }

  componentDidMount() {
    this.refreshProblem();
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.url !== nextState.url){
      window.URL.revokeObjectURL(this.state.url);
    }
    if (JSON.stringify(this.props.problem) !== JSON.stringify(nextProps.problem)){
      this.refreshProblem(nextProps.problem);
    }
    return JSON.stringify(this.props) !== JSON.stringify(nextProps) ||
           JSON.stringify(this.state) !== JSON.stringify(nextState);
  }
  
  refreshProblem(p) {
    const problem = p || this.props.problem;
    const {toast, contest} = this.props;
    this.setState({loading: true});
    axios.post('/api/problem', {
      cid: contest.cid, probid: problem.probid
    }, {responseType: 'arraybuffer', ...Auth.getHeader()})
      .then(res => {
        let blob = new Blob([res.data], {type: 'application/pdf'});
        let url = window.URL.createObjectURL(blob);
        this.setState({loading: false, url});
      })
      .catch(() => {
        this.setState({loading: false});
        toast('Something went wrong, please reload the app.');
      });
  }

  render() {
    const {problem} = this.props;
    const {url, loading} = this.state;
    return (
      <div style={{height: '100%'}}>
        {loading && <Loading />}
        <div>
          <a href={url} download={`${problem.shortname} - ${problem.name}.pdf`}>
            <Button raised color="primary" style={{width: '100%'}}>Download</Button>
          </a>
        </div>
        <object data={url} type="application/pdf" style={{width: '100%', height: 'calc(100% - 36px)'}}>
          If you can't view PDF file in browser. <a href={url} download={`${problem.shortname} - ${problem.name}.pdf`}><span style={{color: 'blue', textDecoration: 'underline'}}>Download it!</span></a>
        </object>
      </div>
    );
  }
}

ProblemView.PropTypes = {
  toast: PropTypes.func.isRequired,
  contest: PropTypes.object.isRequired,
  problem: PropTypes.number.isRequired,
};

export default ProblemView;
