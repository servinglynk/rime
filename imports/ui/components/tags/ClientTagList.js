import React, { Component } from 'react';
import Select from 'react-select';
// import ClientTagItem from './ClientTagItem';
import DataTable2 from '/imports/ui/components/dataTable/DataTable2'; // FIXME
import { removeClientTagButton } from '/imports/ui/dataTable/helpers.js';
import DatePicker from 'react-datepicker';
import moment from 'moment';


function dateOnly(m) {
  const dateString = moment(m).format('YYYY-MM-DD');
  return moment(dateString);
}


class ClientTagList extends Component {
  constructor() {
    super();
    this.state = {};
    this.handleChange = this.handleChange.bind(this);
    this.renderDatePicker = this.renderDatePicker.bind(this);
    this.toggleNewTag = this.toggleNewTag.bind(this);
    this.renderNewClientTag = this.renderNewClientTag.bind(this);
    this.createNewTag = this.createNewTag.bind(this);
    this.getDate = this.getDate.bind(this);
  }

  getDate() {
    return dateOnly(this.state.date);
  }

  createNewTag() {
    const appliedOn = moment(this.state.newTagDate || new Date()).format('YYYY-MM-DDT00:00');
    const newTagData = {
      clientId: this.props.clientId,
      tagId: this.state.newTagId.value,
      appliedOn,
      operation: this.state.newTagAction.value,
      note: this.state.note,
    };
    this.props.newClientTagHandler(newTagData);
  }

  toggleNewTag() {
    this.setState({ newTag: !this.state.newTag });
  }

  handleChange(key, input) {
    this.setState({ [key]: input });
  }

  handleInputChange(key, event) {
    const input = event.target.value;
    this.setState({ [key]: input });
  }

  renderDatePicker(key) {
    const dateValue = this.state && this.state[key];
    return (<DatePicker
      className="form-control"
      selected={dateValue ? moment(dateValue) : moment(Date.now())}
      onChange={(value) => this.handleChange(key, value)}
      placeholderText="MM/DD/YYYY"
    />);
  }

  renderNewClientTag() {
    const { newTag, newTagId, newTagAction } = this.state || {};
    const { tags } = this.props;
    const tagList = tags.map(({ id, name }) => ({ value: id, label: name }));

    const actionsList = [{ value: 0, label: 'Disabled' }, { value: 1, label: 'Applied' }];

    return (<div style={{ padding: '10px' }} className="form form-inline">
      {!newTag && <a onClick={this.toggleNewTag}>Add new tag</a>}
      {newTag && <div>
        <label>Add new tag:
          {/* <input
            type="text" className="form-control input-sm"
            placeholder=""
          /> */}
        </label>
        <div className="form-group" style={{ minWidth: '12em', padding: '0 .25em' }}>
          <Select
            value={newTagId}
            onChange={(option) => this.handleChange('newTagId', option)}
            options={tagList}
            placeholder="Select tag:"
          />
        </div>
        <div className="form-group" style={{ minWidth: '12em', padding: '0 .25em' }}>
          <Select
            value={newTagAction}
            onChange={(option) => this.handleChange('newTagAction', option)}
            options={actionsList}
            placeholder="Select action:"
          />
        </div>
        <div className="form-group" style={{ minWidth: '12em', padding: '0 .25em' }}>
          {this.renderDatePicker('newTagDate')}
        </div>
        <div className="form-group" style={{ minWidth: '12em', padding: '0 .25em' }}>
          <input
            type="text"
            placeholder="note"
            className="form-control input-sm"
            onChange={(value) => this.handleInputChange('note', value)}
          />
        </div>
        <a
          className="btn btn-primary"
          onClick={this.createNewTag} style={{ margin: '0 .25em' }}
        >
          Create
        </a>
        <a
          className="btn btn-default"
          onClick={this.toggleNewTag}
          style={{ margin: '0 .25em' }}
        >
          Cancel
        </a>
      </div>
      }
    </div>);
  }

  render() {
    // TODO: needed columns: tagId, action, appliedOn, appliedBy, remove

    const { clientTags } = this.props;
    const activeDateInMs = this.getDate().valueOf();

    const tagsActivityMap = clientTags
      .map(cTag => ({ appliedOnMs: dateOnly(cTag.appliedOn).valueOf(), ...cTag }))
      .filter(({ appliedOnMs }) => appliedOnMs <= activeDateInMs)
      .sort((a, b) => a.appliedOnMs - b.appliedOnMs)
      .reduce((all, cTag) => ({
        ...all,
        [cTag.tag.name]: cTag.operation,
      }), {})
      ;
    const activeTagNames = Object.keys(tagsActivityMap).filter(key => tagsActivityMap[key]);

    const tableOptions = {
      columns: [
        {
          title: 'Tag Name',
          data: 'name',
          render(value, op, doc) {
            return doc.tag.name;
          },
        },
        {
          title: 'Operation',
          data: 'operation',
          render(value) {
            return value == 0 ? 'Removed' : 'Added'; // eslint-disable-line eqeqeq
          },
        },
        {
          title: 'Applied On',
          data: 'appliedOn',
          render(value) {
            return moment(value).format('MM/DD/YYYY');
          },
        },
        removeClientTagButton((clientTag) => {
          if (this.props.removeClientTagHandler) {
            this.props.removeClientTagHandler(clientTag);
          }
        }),
      ],
    };

    const options = tableOptions;

    const disabled = true;
    // const { maskedValue } = this.state;
    // resolveData={data => data.filter(({ appliedOn }) => appliedOn < activeDateInMs)}

    // TODO: move padding to style

    const listOfActiveTags = activeTagNames.length > 0 ?
      activeTagNames.join(', ') : 'none';

    return (
      <div className="tag-list-wrapper">
        <div className="tag-filter" style={{ padding: '10px' }}>
          Active tags by date:
          {this.renderDatePicker('date')}
          <strong>{listOfActiveTags}</strong>
        </div>
        <br />
        <h4>Tags History</h4>
        {this.renderNewClientTag()}
        <div className="tag-list">
          {/* {tags.map((tag, index) =>
            (<ClientTagItem tag={tag} key={`client-tag-${index}`} />))} */}
          <DataTable2
            disableSearch={disabled}
            options={options}
            data={clientTags}
          />
        </div>
      </div>
    );
  }
}

export default ClientTagList;