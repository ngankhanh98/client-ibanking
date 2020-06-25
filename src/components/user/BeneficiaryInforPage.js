
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Table, Input, Button, Popconfirm, Form, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons'

import UserContext from '../../context/user/userContext'


const EditableContext = React.createContext();

const EditableRow = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
}) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef();
    const form = useContext(EditableContext);
    useEffect(() => {
        if (editing) {
            inputRef.current.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({
            [dataIndex]: record[dataIndex],
        });
    };

    const save = async e => {
        try {
            const values = await form.validateFields();
            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{
                    margin: 0,
                }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
                <div
                    className="editable-cell-value-wrap"
                    style={{
                        paddingRight: 24,
                    }}
                    onClick={toggleEdit}
                >
                    {children}
                </div>
            );
    }

    return <td {...restProps}>{childNode}</td>;
};
const BeneficiaryInforPage = () => {

    const userContext = useContext(UserContext)

    const { beneficiaries, addBeneficiaryRes, addBeneficiary, updateListBeneficiaryInfo } = userContext

    const [dataSource, setDataSource] = useState(
        beneficiaries
    )
    const [visible, setVisible] = useState(false)

    const handleDelete = row => {

        // const { beneficiary_account } = record
        // const dataSources = [...dataSource];
        // setDataSource(dataSources.filter(item => item.beneficiary_account !== beneficiary_account));

        const newRow = { ...row, type: "del" }
        const newData = [...dataSource];
        const index = newData.findIndex(item => newRow.beneficiary_account === item.beneficiary_account);
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...newRow });
        setDataSource(newData)
    };

    const handleSave = row => {
        // const newData = [...dataSource];
        // const index = newData.findIndex(item => row.key === item.key);
        // const item = newData[index];
        // newData.splice(index, 1, { ...item, ...row });



        const newRow = { ...row, type: "update" }
        const newData = [...dataSource];
        const index = newData.findIndex(item => newRow.beneficiary_account === item.beneficiary_account);
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...newRow });

        setDataSource(newData)

    };


    const columnsDefault = [
        {
            title: 'name',
            dataIndex: 'beneficiary_name',
            width: '30%',
            editable: true,
        },
        {
            title: 'account number',
            dataIndex: 'beneficiary_account',
        },
        {
            title: 'operation',
            dataIndex: 'operation',
            render: (text, record) =>
                beneficiaries.length >= 1 ? (
                    <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record)}>
                        <a className="text-danger"><DeleteOutlined /> Delete  </a>
                    </Popconfirm>
                ) : null,
        },
    ];

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };
    const columns = columnsDefault.map(col => {
        if (!col.editable) {
            return col;
        }

        return {
            ...col,
            onCell: record => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave: handleSave,
            }),
        };
    });

    const onFinish = values => {
        // const { addBeneficiary } = this.props
        addBeneficiary({
            beneficiary_account: values.accountnumber,
            name: values.remindname || ''
        })

        if (!addBeneficiaryRes) {
            //change state here for add
        }
    };

    const onFinishFailed = errorInfo => {
        console.log('Failed:', errorInfo);
    };

    const onSaveChanges = () => {
        // useEffect
        // useEffect(() => {
        updateListBeneficiaryInfo(dataSource)
        // }, [])
    }

    // console.log(dataSource);
    return (
        <div>
            <Button
                onClick={() => setVisible(true)}
                type="primary"
                style={{
                    marginBottom: 16,
                }}
            >
                Add a beneficiry
        </Button>
            <div>
                <Modal
                    title="Basic Modal"
                    visible={visible}
                    onOk={() => setVisible(false)}
                    onCancel={() => setVisible(false)}
                >
                    <Form
                        name="basic"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item
                            name="remindname"
                        // rules={[{ required: true, message: 'Please input beneficiary name!' }]}
                        >
                            <Input placeholder="Remind Name" />
                        </Form.Item>

                        <Form.Item
                            name="accountnumber"
                            rules={[{ required: true, message: 'Please input beneficiary account number!' }]}
                        >
                            <Input placeholder="beneficiary account number" />
                        </Form.Item>

                        <Form.Item >
                            <Button type="primary" htmlType="submit">
                                Submit
        </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
            <Table rowKey="beneficiary_account"
                components={components}
                rowClassName={() => 'editable-row'}
                bordered
                dataSource={dataSource.filter(item => item.type !== "del")}
                columns={columns}
            />
            <Button onClick={onSaveChanges}>Save changes</Button>
        </div>
    );
}
export default BeneficiaryInforPage