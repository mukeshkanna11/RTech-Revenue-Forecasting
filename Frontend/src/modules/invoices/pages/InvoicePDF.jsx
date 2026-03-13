import {
Document,
Page,
Text,
View,
StyleSheet,
Image
} from "@react-pdf/renderer";

import logo from "../../../assets/Rtech-logo.png";

/* ---------- HELPER ---------- */

const money = (value)=> `Rs ${Math.round(value || 0)}`;

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({

page:{
padding:32,
fontSize:10,
fontFamily:"Helvetica",
position:"relative"
},

/* WATERMARK */

watermark:{
position:"absolute",
top:"45%",
left:"25%",
fontSize:72,
opacity:0.18,
color:"#9ca3af",
transform:"rotate(-30deg)"
},

/* HEADER */

header:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"flex-start",
marginBottom:18
},

companyBlock:{
maxWidth:250
},

logo:{
width:85,
marginBottom:6
},

companyName:{
fontSize:15,
fontWeight:"bold"
},

companyInfo:{
fontSize:9,
color:"#555",
lineHeight:1.4
},

invoiceBlock:{
alignItems:"flex-end"
},

invoiceTitle:{
fontSize:26,
fontWeight:"bold",
marginBottom:4
},

status:{
marginTop:6,
padding:3,
fontSize:9,
width:70,
textAlign:"center"
},

paid:{backgroundColor:"#16a34a",color:"#fff"},
pending:{backgroundColor:"#f59e0b",color:"#fff"},
draft:{backgroundColor:"#6b7280",color:"#fff"},

/* CLIENT */

section:{
marginTop:6
},

sectionTitle:{
fontSize:11,
fontWeight:"bold",
marginBottom:3
},

/* TABLE */

tableHeader:{
flexDirection:"row",
borderBottom:"1px solid #d1d5db",
paddingBottom:5,
marginTop:15
},

row:{
flexDirection:"row",
borderBottom:"1px solid #eee",
paddingVertical:5
},

col1:{width:"40%"},
col2:{width:"12%"},
col3:{width:"16%"},
col4:{width:"12%"},
col5:{width:"20%"},

/* TOTALS */

totalsWrapper:{
flexDirection:"row",
justifyContent:"flex-end",
marginTop:15
},

totalsBox:{
width:200,
borderTop:"1px solid #d1d5db",
paddingTop:6
},

totalRow:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:4
},

grandTotal:{
fontSize:12,
fontWeight:"bold",
borderTop:"1px solid #ccc",
paddingTop:5
},

/* FOOTER */

footer:{
marginTop:25,
fontSize:9,
textAlign:"center",
color:"#6b7280"
}

});

/* ---------- COMPONENT ---------- */

export default function InvoicePDF({invoice}){

/* CALCULATIONS */

const subtotal = invoice.items.reduce(
(sum,i)=> sum + i.price * i.quantity,
0
);

const tax = invoice.items.reduce(
(sum,i)=> sum + (i.price * i.quantity * (i.taxPercent/100)),
0
);

const total = subtotal + tax - (invoice.discount || 0);

const status = invoice.status || "draft";

return(

<Document>

<Page size="A4" style={styles.page}>


{/* WATERMARK */}

<Text style={styles.watermark}>
{status.toUpperCase()}
</Text>


{/* HEADER */}

<View style={styles.header}>

<View style={styles.companyBlock}>

<Image
style={styles.logo}
src={logo}
/>

<Text style={styles.companyName}>
ReadyTechSolutions
</Text>

<Text style={styles.companyInfo}>
2nd Floor, 149, Sri Nagar
</Text>

<Text style={styles.companyInfo}>
Peelamedu, Coimbatore, Tamil Nadu 641004
</Text>

<Text style={styles.companyInfo}>
Phone: 070107 97721
</Text>

<Text style={styles.companyInfo}>
Email: info@readytechsolutions.in
</Text>

</View>


<View style={styles.invoiceBlock}>

<Text style={styles.invoiceTitle}>
INVOICE
</Text>

<Text>
Invoice #: {invoice.invoiceNumber}
</Text>

<Text>
Date: {new Date(invoice.createdAt).toLocaleDateString()}
</Text>

<Text
style={[
styles.status,
status==="paid"
? styles.paid
: status==="pending"
? styles.pending
: styles.draft
]}
>
{status.toUpperCase()}
</Text>

</View>

</View>


{/* CLIENT */}

<View style={styles.section}>

<Text style={styles.sectionTitle}>
Bill To
</Text>

<Text>{invoice.client?.companyName}</Text>
<Text>{invoice.client?.email}</Text>
<Text>{invoice.client?.phone}</Text>

</View>


{/* TABLE HEADER */}

<View style={styles.tableHeader}>

<Text style={styles.col1}>Description</Text>
<Text style={styles.col2}>Qty</Text>
<Text style={styles.col3}>Price</Text>
<Text style={styles.col4}>Tax</Text>
<Text style={styles.col5}>Total</Text>

</View>


{/* TABLE ROWS */}

{invoice.items.map((item,index)=>{

const totalItem =
item.price * item.quantity * (1 + item.taxPercent/100);

return(

<View key={index} style={styles.row}>

<Text style={styles.col1}>
{item.description}
</Text>

<Text style={styles.col2}>
{item.quantity}
</Text>

<Text style={styles.col3}>
{money(item.price)}
</Text>

<Text style={styles.col4}>
{item.taxPercent}%
</Text>

<Text style={styles.col5}>
{money(totalItem)}
</Text>

</View>

);

})}


{/* TOTALS */}

<View style={styles.totalsWrapper}>

<View style={styles.totalsBox}>

<View style={styles.totalRow}>
<Text>Subtotal</Text>
<Text>{money(subtotal)}</Text>
</View>

<View style={styles.totalRow}>
<Text>Tax</Text>
<Text>{money(tax)}</Text>
</View>

<View style={styles.totalRow}>
<Text>Discount</Text>
<Text>{money(invoice.discount)}</Text>
</View>

<View style={[styles.totalRow,styles.grandTotal]}>
<Text>Total</Text>
<Text>{money(total)}</Text>
</View>

</View>

</View>


{/* FOOTER */}

<Text style={styles.footer}>

Thank you for choosing ReadyTechSolutions.  
For assistance contact info@readytechsolutions.in

</Text>

</Page>

</Document>

);

}