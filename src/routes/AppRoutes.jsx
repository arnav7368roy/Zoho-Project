import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import PrivateRoute from '../components/Layout/PrivateRoute';
import PublicRoute from '../components/Layout/PublicRoute';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Projects from '../pages/Projects/Projects';
import Tasks from '../pages/Tasks/Tasks';
import Issues from '../pages/Issues/Issues';
import Team from '../pages/Team/Team';
import Milestones from '../pages/Milestones/Milestones';
import TimeLogs from '../pages/TimeLogs/TimeLogs';
import Notifications from '../pages/Notifications/Notifications';
import Profile from '../pages/Profile/Profile';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <Layout>
              <Projects />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/tasks"
        element={
          <PrivateRoute>
            <Layout>
              <Tasks />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/issues"
        element={
          <PrivateRoute>
            <Layout>
              <Issues />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/team"
        element={
          <PrivateRoute>
            <Layout>
              <Team />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/documents"
        element={
          <PrivateRoute>
            <Layout>
              <Projects />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/milestones"
        element={
          <PrivateRoute>
            <Layout>
              <Milestones />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/time-logs"
        element={
          <PrivateRoute>
            <Layout>
              <TimeLogs />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/expenses"
        element={
          <PrivateRoute>
            <Layout>
              <Tasks />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/test-cases"
        element={
          <PrivateRoute>
            <Layout>
              <Issues />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Layout>
              <Notifications />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <Profile />
            </Layout>
          </PrivateRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
