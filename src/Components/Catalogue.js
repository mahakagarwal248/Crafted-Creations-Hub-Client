import { useEffect, useState } from 'react';
import { getProducts } from '../APIs';
import Navbar from './Navbar';
import ProductGrid from './Grid';

function Catalogue() {
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData().then((res) => {
            setTotal(res.totalCount)
            if(res.categories){
                setProducts(res.categories)
                setLoading(false)
            }
        }).catch((err)=> {
            console.log(err)
            window.alert(err)
        });      
    }, [])

    const fetchData = async () => {
        const response = await getProducts();
        return response;
    }

    if (loading) return <p>Loading products...</p>;

    return (
        <div style={{ color: 'white' }}>
            <Navbar />
            <p>Total Number of Products: {total}</p>
            <ProductGrid data={products} />
        </div>
    );
}

export default Catalogue;