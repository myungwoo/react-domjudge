import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import Auth from '../storages/auth';

class Submissions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submissions: [],
    };
  }

  componentDidMount() {
    this.refreshSubmission();
  }

  refreshSubmission() {
    const {setLoading, contest} = this.props;
    setLoading(true);
    axios.post('/api/submissions', {
      cid: contest.cid
    }, Auth.getHeader())
      .then(res => {
        this.setState({submissions: res});
        setLoading(false);
      });
  }

  render() {
    return (
      <div>
      </div>
    );
  }
}

Submissions.propTypes = {
  setLoading: PropTypes.func.isRequired,
  contest: PropTypes.object.isRequired,
};

export default Submissions;
