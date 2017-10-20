import React from 'react';
import PropTypes from 'prop-types';

import {Grid, Row, Col} from 'react-bootstrap';

import {Typography} from 'material-ui';
import {LinearProgress} from 'material-ui/Progress';

import WhiteBox from './components/white-box';
import Submissions from './components/submissions';

import './bootstrap.min.css';

class Overview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const styles = {
      title: {paddingTop: 10, paddingBottom: 10, textAlign: 'center'}
    };
    const {contest} = this.props;
    return (
      <Grid fluid>
        <Row>
          <Col md={6} style={{marginBottom: 15}}>
            <WhiteBox style={{padding: 16}}>
              {this.state.submission_loading && <LinearProgress />}
              <Typography type="title" style={styles.title}>Submissions</Typography>
              <Submissions
                contest={contest}
                setLoading={val => this.setState({submission_loading: val})} />
            </WhiteBox>
          </Col>
          <Col md={6}>
            <Row style={{marginBottom: 15}}>
              <Col md={12}>
                <WhiteBox style={{padding: 16}}>
                  <Typography type="title" style={styles.title}>Clarifications</Typography>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                  quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                  proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </WhiteBox>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <WhiteBox style={{padding: 16}}>
                  <Typography type="title" style={styles.title}>Clarification Requests</Typography>
                  Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                  tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                  quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                  proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </WhiteBox>
              </Col>
            </Row>
          </Col>
        </Row>
      </Grid>
    );
  }
}

Overview.PropTypes = {
  toast: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
  contest: PropTypes.object.isRequired,
  state: PropTypes.number.isRequired
};

export default Overview;
