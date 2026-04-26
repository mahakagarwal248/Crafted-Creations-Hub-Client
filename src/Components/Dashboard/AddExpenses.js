import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { addExpenses } from '../../APIs/Orders';

function AddExpenses() {
    const [obj, setObj] = useState({
        description: "",
        amount: 0,
        paidAt: ""
    });
    const [isSubmitClicked, setIsSubmitClicked] = useState(false)

    const setValues = (field, value) => {
        setObj({ ...obj, [field]: value})
    }

    const onSubmit = async () => {
        if(isSubmitClicked) return;
        else setIsSubmitClicked(true);

        if(obj.description === "" || obj.amount === 0 || obj.paidAt === ""){
            window.alert("Invalid data!")
        }else{
            let response = await addExpenses(obj);
            console.log(response);
            setIsSubmitClicked(false)
            if(response && response.status === 200){
                window.alert("Expense Added successfully!")
            }else{
                window.alert(response)
            }
        }
    }
    return (
        <div className="dashboard-panel dashboard-panel--tight">
            <h3>Add expense</h3>
            <div className="dashboard-expense-row">
                <div className="dashboard-expense-field">
                    <label className="form-label">Description</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Description"
                        onChange={(e) => setValues('description', e.target.value)}
                    />
                </div>
                <div className="dashboard-expense-field" style={{ flex: '0 1 120px' }}>
                    <label className="form-label">Amount</label>
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Amount"
                        onChange={(e) => setValues('amount', e.target.value)}
                    />
                </div>
                <div className="dashboard-expense-field">
                    <label className="form-label">Spend at</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="When / where"
                        onChange={(e) => setValues('paidAt', e.target.value)}
                    />
                </div>
                <Button variant="info" onClick={onSubmit}>
                    Submit
                </Button>
            </div>
        </div>
    )
}

export default AddExpenses;