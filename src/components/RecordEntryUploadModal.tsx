@@ .. @@
       console.log('🎉 RecordEntryUploadModal - Upload completado exitosamente');
       setUploadStatus('success');
       
-      // Llamar al callback para recargar datos
-      console.log('🔄 RecordEntryUploadModal - Llamando callback onFileUpload...');
-      await onFileUpload(recordFormatId, files, {
+      // Llamar al callback para recargar datos después de un pequeño delay
+      console.log('🔄 RecordEntryUploadModal - Esperando antes de recargar...');
+      await new Promise(resolve => setTimeout(resolve, 500)); // Dar tiempo a que se propague en BD
+      
+      console.log('🔄 RecordEntryUploadModal - Llamando callback onFileUpload...');
+      onFileUpload(recordFormatId, files, {
         name: recordEntryName,
         fechaRealizacion,
         notes
       });
-      console.log('✅ RecordEntryUploadModal - Callback completado');
       
       alert('Registro lleno subido exitosamente');
       
       setTimeout(() => {
         resetForm();
-      }, 1000);
+      }, 1500);
     } catch (error) {
       console.error('❌ RecordEntryUploadModal - Error completo:', error);
       setUploadStatus('error');