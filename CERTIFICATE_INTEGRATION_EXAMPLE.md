/**
 * Certificate Integration Example
 * 
 * This shows how to integrate the Certificate component
 * into StudentCourseContent.jsx to display when course is completed
 * 
 * Location: frontend/src/pages/student/StudentCourseContent.jsx
 */

// ============================================
// 1. ADD IMPORT AT TOP
// ============================================
import Certificate from '../../components/Certificate';


// ============================================
// 2. ADD STATE FOR CERTIFICATE DISPLAY (optional)
// ============================================
const [showCertificate, setShowCertificate] = useState(false);


// ============================================
// 3. ADD THIS IN YOUR JSX WHERE YOU CURRENTLY
//    SHOW THE "Download Certificate" BUTTON
// ============================================

{progress.is_completed && (
  <div style={styles.certificateCard}>
    <h3 style={styles.certificateTitle}>🏆 Course Completed!</h3>
    <p style={styles.certificateText}>
      Congratulations! You've successfully completed this course.
    </p>

    {/* Option A: Show Certificate Full View with Print Button */}
    {showCertificate && (
      <div style={{
        marginTop: '20px',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#F9FAFB',
      }}>
        <Certificate
          studentName={user?.username || 'Student'}
          courseName={courseInfo?.title || 'Course Name'}
          instructorName={courseInfo?.instructor_name || 'Instructor'}
          issueDate={new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          certificateId={`CERT-${id}-${user?.id}`}
        />
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={() => window.print()}
            style={{
              backgroundColor: '#1B9AAA',
              color: 'white',
              border: 'none',
              padding: '10px 24px',
              fontSize: '14px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              marginRight: '10px',
            }}
          >
            🖨 Print / Save as PDF
          </button>
          <button
            onClick={() => setShowCertificate(false)}
            style={{
              backgroundColor: '#E5E7EB',
              color: '#071426',
              border: 'none',
              padding: '10px 24px',
              fontSize: '14px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Hide Certificate
          </button>
        </div>
      </div>
    )}

    {/* Option B: Show Preview with View/Download Buttons */}
    {!showCertificate && (
      <button
        style={{
          marginTop: '15px',
          backgroundColor: '#1B9AAA',
          color: 'white',
          border: 'none',
          padding: '10px 24px',
          fontSize: '14px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#16808D'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#1B9AAA'}
        onClick={() => {
          setShowCertificate(true);
          toast.success('Displaying your certificate!');
        }}
      >
        📜 View & Download Certificate
      </button>
    )}
  </div>
)}


// ============================================
// 4. ALTERNATIVE: SIMPLIFIED BUTTON WITH MODAL
// ============================================

// Add this state
const [certificateModal, setCertificateModal] = useState(false);

// Add this in JSX
{progress.is_completed && (
  <div style={styles.certificateCard}>
    <h3 style={styles.certificateTitle}>🏆 Course Completed!</h3>
    <p style={styles.certificateText}>
      Congratulations! You've successfully completed this course.
    </p>
    <button
      style={styles.certificateButton}
      onClick={() => {
        setCertificateModal(true);
        toast.success('Certificate ready to download!');
      }}
    >
      📜 Download Certificate
    </button>
  </div>
)}

{/* Certificate Modal */}
{certificateModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflow: 'auto',
      padding: '20px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        borderBottom: '1px solid #E5E7EB',
        paddingBottom: '15px',
      }}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#142C52' }}>
          Your Certificate
        </h2>
        <button
          onClick={() => setCertificateModal(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6B7280',
          }}
        >
          ✕
        </button>
      </div>

      {/* Certificate */}
      <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
        <Certificate
          studentName={user?.username || 'Student'}
          courseName={courseInfo?.title || 'Course Name'}
          instructorName={courseInfo?.instructor_name || 'Instructor'}
          issueDate={new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
          certificateId={`CERT-${id}-${user?.id}`}
        />
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end',
        borderTop: '1px solid #E5E7EB',
        paddingTop: '15px',
      }}>
        <button
          onClick={() => setCertificateModal(false)}
          style={{
            backgroundColor: '#E5E7EB',
            color: '#071426',
            border: 'none',
            padding: '10px 20px',
            fontSize: '14px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          Close
        </button>
        <button
          onClick={() => window.print()}
          style={{
            backgroundColor: '#1B9AAA',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            fontSize: '14px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          🖨 Print / Save as PDF
        </button>
      </div>
    </div>
  </div>
)}


// ============================================
// 5. BACKEND INTEGRATION (Django)
// ============================================

/*
# In apps/certificates/models.py
from django.db import models
from django.contrib.auth.models import User
from apps.courses.models import Course

class Certificate(models.Model):
    """Store issued certificates for audit/tracking"""
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    certificate_id = models.CharField(max_length=100, unique=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('student', 'course')
    
    def __str__(self):
        return f"{self.student.username} - {self.course.title}"


# In apps/courses/views.py
from apps.certificates.models import Certificate
from apps.certificates.serializers import CertificateSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def issue_certificate(request, course_id):
    """Issue a certificate to a student"""
    try:
        enrollment = Enrollment.objects.get(
            student=request.user,
            course_id=course_id
        )
        
        if not enrollment.is_completed:
            return Response(
                {'error': 'Course not yet completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create or get certificate
        certificate, created = Certificate.objects.get_or_create(
            student=request.user,
            course_id=course_id,
            defaults={
                'certificate_id': f"CERT-{course_id}-{request.user.id}-{int(timezone.now().timestamp())}"
            }
        )
        
        serializer = CertificateSerializer(certificate)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Enrollment.DoesNotExist:
        return Response(
            {'error': 'Not enrolled in this course'},
            status=status.HTTP_404_NOT_FOUND
        )


# In apps/certificates/serializers.py
from rest_framework import serializers
from apps.certificates.models import Certificate

class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.username', read_only=True)
    course_name = serializers.CharField(source='course.title', read_only=True)
    instructor_name = serializers.CharField(
        source='course.instructor.get_full_name',
        read_only=True
    )
    
    class Meta:
        model = Certificate
        fields = [
            'id',
            'certificate_id',
            'student_name',
            'course_name',
            'instructor_name',
            'issued_at',
        ]
*/


// ============================================
// 6. FRONTEND API CALL TO ISSUE CERTIFICATE
// ============================================

async function issueCertificate(courseId) {
  try {
    const token = localStorage.getItem('access');
    const response = await axios.post(
      `https://edu-village-6j7f.onrender.com//api/certificates/issue/`,
      { course_id: courseId },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    toast.success('Certificate issued! You can now download it.');
    return response.data;
  } catch (error) {
    toast.error('Failed to issue certificate');
    console.error(error);
  }
}


// ============================================
// 7. USE IN EVENT HANDLER
// ============================================

const handleDownloadCertificate = async () => {
  await issueCertificate(id);
  setCertificateModal(true);
};
