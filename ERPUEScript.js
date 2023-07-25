/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/currentRecord', 'N/record', 'N/recordContext', 'N/runtime', 'N/search', 'N/ui/message', 'N/ui/serverWidget'],
    /**
 * @param{currentRecord} currentRecord
 * @param{record} record
 * @param{recordContext} recordContext
 * @param{runtime} runtime
 * @param{search} search
 * @param{message} message
 * @param{serverWidget} serverWidget
 */
    (currentRecord, record, recordContext, runtime, search, message, serverWidget) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            try{
                var recordObj = scriptContext.newRecord
                var futureShip;
                var fulfilled;

                var salesorderSearchObj = search.create({
                    type: "salesorder",
                    filters:
                        [
                            ["type","anyof","SalesOrd"],
                            "AND",
                            ["mainline","is","T"],
                            "AND",
                            ["custbody_lf_art_dept_fields","anyof","@ALL@"],
                            "AND",
                            ["custtype","anyof","@ALL@"],
                            "AND",
                            ["custbody_lf_prod_status","anyof","14","15","16"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "amount",
                                summary: "SUM"
                            })
                        ]
                });

                var invoiceSearchObj = search.create({
                    type: "invoice",
                    filters:
                        [
                            ["type","anyof","CustInvc"],
                            "AND",
                            ["datecreated","within","thismonthtodate"]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "amount",
                                summary: "SUM"
                            })
                        ]
                });
                var searchResultCount = invoiceSearchObj.runPaged().count;

                invoiceSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    fulfilled = result.getValue({
                        name: 'amount',
                        summary: 'SUM'
                    })
                    recordObj.setValue({
                        fieldId: 'custrecord_lf_fulfilled_ers',
                        value: fulfilled
                    })

                    return true;
                });



                var searchResultCount = salesorderSearchObj.runPaged().count;

                salesorderSearchObj.run().each(function(result){
                    // .run().each has a limit of 4,000 results
                    futureShip = result.getValue({
                        name: 'amount',
                        summary: 'SUM'
                    })
                    recordObj.setValue({
                        fieldId: 'custrecord_lf_futureship_ers',
                        value: futureShip
                    })


                    return true;
                });

            }catch (e) {
                log.debug("Error", e)
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

            try{
                 var recordObj = scriptContext.newRecord

                var productionHours = recordObj.getValue({
                    fieldId: 'custrecord_lf_production_hours_ers'
                })

                var fullfilled = recordObj.getValue({
                    fieldId: 'custrecord_lf_fulfilled_ers'
                })

                var futureShip = recordObj.getValue({
                    fieldId: 'custrecord_lf_futureship_ers'
                })

                var results = Math.round((fullfilled + futureShip) / productionHours)

                recordObj.setValue({
                    fieldId: 'custrecord_lf_results_ers',
                    value: results
                })



                var answer = " ";

                 if(results <= 249){

                     recordObj.setValue({
                         fieldId: 'custrecord_lf_payout_determination',
                         value: "No Payout"
                     })
                 }else if(results  === 250 ){

                     recordObj.setValue({
                         fieldId: 'custrecord_lf_payout_determination',
                         value: "Payout: $30/per month"
                     })

                }else if(results  >= 251 && results <= 275){

                     recordObj.setValue({
                         fieldId: 'custrecord_lf_payout_determination',
                         value: "Payout: $40/per month"
                     })
                }else if(results >= 276 &&  results <= 300){

                     recordObj.setValue({
                         fieldId: 'custrecord_lf_payout_determination',
                         value: "Payout: $50/per month"
                     })

                }else if(results >= 301 && results <= 325){

                     recordObj.setValue({
                         fieldId: 'custrecord_lf_payout_determination',
                         value: "Payout: $60/per month"
                     })

                }else if(results >= 326){

                     recordObj.setValue({
                         fieldId: 'custrecord_lf_payout_determination',
                         value: "Payout: $70/per month"
                     })

                }




            }catch (e){
                log.debug("Error", e)
            }




        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {


        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
