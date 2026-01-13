<template>
  <div class="backoffice-layout">
    <div class="content-wrapper">
      <!-- Modern Hero Header -->
      <div class="profile-hero mb-5">
        <div class="hero-content">
          <div class="d-flex align-items-center gap-3 mb-3">
             <div class="hero-icon-wrapper">
                <i class="fas fa-user-circle"></i>
             </div>
             <div>
                <h1 class="hero-title">My Profile</h1>
                <nav aria-label="breadcrumb">
                   <ol class="breadcrumb mb-0">
                      <li class="breadcrumb-item"><a href="#" class="text-white opacity-75 text-decoration-none">Home</a></li>
                      <li class="breadcrumb-item active text-white" aria-current="page">Profile</li>
                   </ol>
                </nav>
             </div>
          </div>
          <p class="hero-subtitle">Update your personal information and manage your account settings.</p>
        </div>
        <div class="hero-pattern"></div>
      </div>

      <div class="row justify-content-center">
         <div class="col-lg-8">
            <div class="section-card">
               <div class="section-header">
                  <div class="section-title">
                     <span class="section-icon emerald"><i class="fas fa-id-card"></i></span>
                     <span>Personal Information</span>
                  </div>
               </div>
               
               <div class="card-body p-4">
                  <div v-if="loading" class="text-center p-5">
                     <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                     </div>
                  </div>

                  <form v-else @submit.prevent="handleSave">
                     <!-- Avatar Section -->
                     <div class="text-center mb-5">
                        <div class="user-avatar-xl mx-auto mb-3" :style="avatarStyle">
                           {{ userInitials }}
                        </div>
                        <h4 class="mb-1">{{ form.firstName }} {{ form.lastName }}</h4>
                        <!-- Display Roles as Badges -->
                        <div class="d-flex justify-content-center gap-2 mt-2">
                           <span v-for="role in user?.roles" :key="role" class="badge bg-light text-primary border border-primary-subtle">
                              {{ role }}
                           </span>
                           <span v-if="!user?.roles?.length" class="text-muted small">User</span>
                        </div>
                     </div>

                     <div class="row g-4">
                        <div class="col-md-6">
                           <div class="form-group">
                              <label class="form-label">First Name <span class="text-danger">*</span></label>
                              <input 
                                 v-model="form.firstName" 
                                 type="text" 
                                 class="form-control form-input" 
                                 required
                              />
                           </div>
                        </div>
                        <div class="col-md-6">
                           <div class="form-group">
                              <label class="form-label">Last Name <span class="text-danger">*</span></label>
                              <input 
                                 v-model="form.lastName" 
                                 type="text" 
                                 class="form-control form-input" 
                                 required
                              />
                           </div>
                        </div>
                        
                        <div class="col-12">
                           <div class="form-group">
                              <label class="form-label">Email Address</label>
                              <div class="input-group">
                                 <span class="input-group-text bg-light border-end-0">
                                    <i class="fas fa-envelope text-muted"></i>
                                 </span>
                                 <input 
                                    :value="user?.email" 
                                    type="email" 
                                    class="form-control form-input border-start-0 bg-light" 
                                    readonly 
                                    disabled
                                 />
                                 <span class="input-group-text bg-light text-muted small">
                                    <i class="fas fa-lock"></i>
                                 </span>
                              </div>
                              <div class="form-text small mt-1">
                                 <i class="fas fa-info-circle me-1"></i>Email cannot be changed. Please contact admin for support.
                              </div>
                           </div>
                        </div>
                     </div>

                     <div class="d-flex justify-content-end mt-5 pt-3 border-top">
                        <button type="submit" class="btn btn-primary px-4" :disabled="saving">
                           <span v-if="saving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                           Save Changes
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
    </div>
  </div> 
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { meApi, type UserProfile } from '../../me/me.api';
import { showSuccess, showError } from '@/core/utils/swal';

// Data state
const loading = ref(true);
const saving = ref(false);
const user = ref<UserProfile | null>(null);

const form = ref({
   firstName: '',
   lastName: ''
});

// Computed
const userInitials = computed(() => {
   const first = form.value.firstName?.[0] || '';
   const last = form.value.lastName?.[0] || '';
   return (first + last).toUpperCase() || '?';
});

const avatarStyle = computed(() => {
   const colors = ['#059669', '#0891b2', '#2563eb', '#7c3aed', '#db2777', '#ea580c'];
   const index = (user.value?.email.length || 0) % colors.length;
   return { backgroundColor: colors[index] };
});

// Methods
const loadProfile = async () => {
   loading.value = true;
   try {
      const data = await meApi.getMe();
      user.value = data;
      form.value = {
         firstName: data.firstName,
         lastName: data.lastName
      };
   } catch (error) {
      console.error('Failed to load profile:', error);
   } finally {
      loading.value = false;
   }
};

const handleSave = async () => {
   saving.value = true;
   try {
      const updatedUser = await meApi.updateMe(form.value);
      user.value = updatedUser;
      showSuccess('Profile updated successfully!');
   } catch (error) {
      console.error('Failed to update profile:', error);
      showError('Failed to update profile. Please try again.');
   } finally {
      saving.value = false;
   }
};

onMounted(() => {
   loadProfile();
});
</script>

<style scoped>
@import url('../../../style.css');

.backoffice-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-surface-2);
}

.content-wrapper {
  padding-top: var(--navbar-height);
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  padding-bottom: 2rem;
  width: 100%;
}

.section-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

.section-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}
.section-icon.emerald { background: rgba(16, 185, 129, 0.1); color: #10b981; }

.user-avatar-xl {
   width: 120px;
   height: 120px;
   border-radius: 50%;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 3rem;
   color: white;
   font-weight: bold;
   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-label {
   font-weight: 500;
   color: var(--text-secondary);
   margin-bottom: 0.5rem;
}

.form-input {
   padding: 0.75rem 1rem;
   border-radius: 8px;
   border: 1px solid var(--border-color);
   transition: all 0.2s;
}

.form-input:focus {
   border-color: var(--primary-color);
   box-shadow: 0 0 0 3px var(--primary-light);
}

/* Hero Header Styles */
.profile-hero {
   background: linear-gradient(135deg, #059669 0%, #047857 100%);
   border-radius: 24px;
   padding: 3rem;
   color: white;
   position: relative;
   overflow: hidden;
   box-shadow: 0 10px 30px -10px rgba(5, 150, 105, 0.5);
}

.hero-content {
   position: relative;
   z-index: 2;
}

.hero-icon-wrapper {
   width: 64px;
   height: 64px;
   background: rgba(255, 255, 255, 0.2);
   backdrop-filter: blur(10px);
   border-radius: 16px;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 2rem;
   color: white;
   border: 1px solid rgba(255, 255, 255, 0.3);
}

.hero-title {
   font-size: 2.5rem;
   font-weight: 700;
   margin-bottom: 0;
   line-height: 1.2;
   letter-spacing: -0.02em;
}

.hero-subtitle {
   font-size: 1.1rem;
   opacity: 0.9;
   max-width: 600px;
   margin-top: 1rem;
   line-height: 1.6;
}

.hero-pattern {
   position: absolute;
   top: 0;
   right: 0;
   bottom: 0;
   left: 0;
   background-image: radial-gradient(circle at 100% 0%, rgba(255, 255, 255, 0.1) 0%, transparent 25%),
                     radial-gradient(circle at 0% 100%, rgba(255, 255, 255, 0.1) 0%, transparent 25%);
   z-index: 1;
}

.breadcrumb-item + .breadcrumb-item::before {
   color: rgba(255, 255, 255, 0.6);
}
</style>
