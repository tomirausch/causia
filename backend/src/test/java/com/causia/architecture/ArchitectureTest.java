package com.causia.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/**
 * Reglas de arquitectura que se verifican en cada build. Si una IA o una persona las rompe, falla el CI.
 * Convención: cada módulo de negocio vive en com.causia.<modulo> con subpaquetes web, application, domain e infrastructure.
 */
@AnalyzeClasses(packages = "com.causia", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule dominioNoDependeDeLaWeb =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAnyPackage("..web..", "org.springframework.web..");

    @ArchTest
    static final ArchRule controladoresNoAccedenARepositorios =
        noClasses().that().resideInAPackage("..web..")
            .should().dependOnClassesThat().haveSimpleNameEndingWith("Repository");

    @ArchTest
    static final ArchRule sinInyeccionPorCampo =
        noClasses().should().dependOnClassesThat().areAssignableTo(org.springframework.beans.factory.annotation.Autowired.class)
            .because("se usa inyección por constructor");

    @ArchTest
    static final ArchRule controladoresEnPaqueteWeb =
        classes().that().areAnnotatedWith(org.springframework.web.bind.annotation.RestController.class)
            .should().resideInAPackage("..web..");
}
