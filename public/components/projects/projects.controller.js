(function () {

    angular
        .module('app')
        .controller('ProjectsController', ProjectsController);

    ProjectsController.$inject = [
        'authService',
        'projectsService',
        '$mdDialog',
        '$scope',
        '$timeout'
    ];

    function ProjectsController(authService, projectsService, $mdDialog, $scope, $timeout) {

        var vm = this;
        vm.authService = authService;

        function refreshProjectsList(profile) {
            projectsService.getProjects(profile)
                .then(function (projects) {
                    vm.projects = projects;
                });
        }


        authService.getProfileDeferred().then(function (profile) {
            vm.profile = profile;

            refreshProjectsList(profile);
        });


        vm.createProject = function (ev) {
            $mdDialog.show({
                controller : DialogController,
                templateUrl : 'components/projects/newproject.tmpl.html',
                parent : angular.element(document.body),
                targetEvent : ev,
                clickOutsideToClose : true
            })
            .then(
                function(project) {
                    projectsService.createProject(project, vm.profile.user_id, vm.profile.tenant)
                        .then(function () {
                            refreshProjectsList(vm.profile);
                        });
                },
                function() {
                    // cancelled. do nothing
                }
            );
        };


        vm.deleteProject = function (ev, project) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure?')
                .textContent('Do you want to delete ' + project.name + '? (This cannot be undone)')
                .ariaLabel('Confirm')
                .targetEvent(ev)
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(
                function() {
                    projectsService.deleteProject(project, vm.profile.user_id, vm.profile.tenant)
                        .then(function () {
                            refreshProjectsList(vm.profile);
                        });
                },
                function() {
                    // cancelled. do nothing
                }
            );
        };



        function DialogController($scope, $mdDialog) {
            $scope.hide = function() {
                $mdDialog.hide();
            };
            $scope.cancel = function() {
                $mdDialog.cancel();
            };
            $scope.confirm = function(resp) {
                $mdDialog.hide(resp);
            };
        }

    }
}());