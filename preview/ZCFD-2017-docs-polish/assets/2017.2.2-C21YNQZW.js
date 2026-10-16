var e=`
# 2017.2.2

- Print correct release version number, 2017.2.1 release inadvertently reported 2017.2.0
- Improved memory allocation reservations outputting to VTK format
- Always sync gradients from GPU when outputting
- Fixed logic to detect lu-sgs
- Fix to allow P4 hexas
- Efficiency improvements to the BR2 diffusive flux scheme
- Wall functions corrected for HO solver
`;export{e as default};