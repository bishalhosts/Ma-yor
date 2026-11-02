/* SITE DATA - replace placeholders with verified official information. */
const SITE={
  mayor:"[Mayor Full Name]",title:{en:"Mayor, Sample Municipality",ne:"नगरप्रमुख, नमुना नगरपालिका"},
  name:{en:"Office of the Mayor",ne:"नगरप्रमुखको कार्यालय"},
  office:{en:"Office of the Municipal Executive",ne:"नगर कार्यपालिकाको कार्यालय"},
  place:{en:"[Province], [District], Nepal",ne:"[प्रदेश], [जिल्ला], नेपाल"},
  address:"[Municipality Office Address]",phone:"+977-XX-XXXXXX",email:"info@example.gov.np",hours:"Sun–Fri, 10:00 AM – 5:00 PM",
  wards:9,
  APPS_SCRIPT_URL:"PASTE_PUBLIC_APPS_SCRIPT_WEB_APP_URL_HERE",   // Deployment A (Anyone)
  ADMIN_URL:"PASTE_ADMIN_APPS_SCRIPT_WEB_APP_URL_HERE",          // Deployment B (Google login, admins only)
  ticker:["Welcome to the official website of the Mayor (demo content).","Citizens can submit complaints and suggestions through Nagarik Voice.","[Add latest announcement here]"],
  notices:[
    {id:"n1",title:"Sample Notice: Property Tax Collection",date:"2026-10-20",cat:"Tax",desc:"Placeholder text. Replace with the official notice."},
    {id:"n2",title:"Sample Notice: Vaccination Camp",date:"2026-10-15",cat:"Health",desc:"Placeholder text. Replace with the official notice."},
    {id:"n3",title:"Sample Notice: Road Maintenance Schedule",date:"2026-10-08",cat:"Development",desc:"Placeholder text. Replace with the official notice."},
    {id:"n4",title:"Sample Notice: Tender Invitation",date:"2026-09-30",cat:"Tender",desc:"Placeholder text. Replace with the official notice."}],
  projects:[
    {t:"Sample Road Upgrade",ward:2,cat:"Infrastructure",img:"p1.svg",d:"Demo description.",budget:"[Not published]",start:"[Date]",end:"[Date]",status:"Planned"},
    {t:"Sample Drinking Water Project",ward:5,cat:"Water",img:"p2.svg",d:"Demo description.",budget:"[Not published]",start:"[Date]",end:"[Date]",status:"Ongoing"},
    {t:"Sample Health Post Building",ward:7,cat:"Health",img:"p3.svg",d:"Demo description.",budget:"[Not published]",start:"[Date]",end:"[Date]",status:"Completed"}],
};
