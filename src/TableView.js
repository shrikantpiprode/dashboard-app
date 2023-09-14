import React, { Component } from 'react';

class TableView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableViewData: null,
      loading: true,
    };
  }

  componentDidMount() {
    // Fetch data from the API
    fetch('http://localhost:8080/alerts/get-data')
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          tableViewData: data,
          loading: false,
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        this.setState({ loading: false });
      });
  }

  render() {
    const { tableViewData, loading } = this.state;

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!tableViewData) {
      return <div>Error: Data not available.</div>;
    }

    // Iterate through the data and create a table
    const tableRows = tableViewData.alert.map((alert) => {
      const resolution = tableViewData.alertsResolution.find(
        (ar) => ar.alertID === alert.alertID
      );

      return (
        <tr key={alert.alertID}>
          <td>{alert.alertID}</td>
          <td>{alert.createdtime}</td>
          <td>{alert.env}</td>
          <td>{alert.count}</td>
          <td>{alert.active ? 'Yes' : 'No'}</td>
          <td>{alert.severity}</td>
          <td>{resolution ? resolution.resolution : 'N/A'}</td>
          <td>{resolution ? resolution.team : 'N/A'}</td>
          <td>{resolution ? resolution.contact : 'N/A'}</td>
        </tr>
      );
    });

    return (
      <div>
        <h1>Table View</h1>
        <table>
          <thead>
            <tr>
              <th>Alert ID</th>
              <th>Created Time</th>
              <th>Environment</th>
              <th>Count</th>
              <th>Active</th>
              <th>Severity</th>
              <th>Resolution</th>
              <th>Team</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>{tableRows}</tbody>
        </table>
      </div>
    );
  }
}

export default TableView;
