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
        <div>
            <h3>Add Expenses</h3> 
            <div style={{ width: "80%", margin: "auto", display: "flex", justifyContent: "space-evenly"}}>
                <input type="text" placeholder="Description" onChange={(e) => setValues("description", e.target.value)} style={{ border: '1px solid white', padding: "2px", borderRadius: "5px", height: "35px"}}/>
                <input type="Number" placeholder="Amount" onChange={(e) => setValues("amount", e.target.value)} style={{ border: '1px solid white', padding: "2px", borderRadius: "5px", height: "35px"}}/>
                <input type="text" placeholder="Spend At" onChange={(e) => setValues("paidAt", e.target.value)} style={{ border: '1px solid white', padding: "2px", borderRadius: "5px", height: "35px"}}/>
                <Button variant="info" onClick={onSubmit}>Submit</Button>
            </div>
        </div>
    )
}

export default AddExpenses;